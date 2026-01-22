import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkBotId } from "botid/server";
import { insertAuditLog } from '@/lib/audit/auditLog';
import { createClient } from '@/lib/supabase-server';

// Validates the OAuth callback parameters
const callbackSchema = z.object({
    code: z.string().min(1),
    next: z.string().optional().default('/'),
});

/**
 * Handles CORS preflight OPTIONS requests for the auth callback route.
 */
export async function OPTIONS(request: Request) {
    try {
        const origin = request.headers.get('origin');
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        });
    } catch (error) {
        await insertAuditLog({
            eventType: 'system',
            severity: 'error',
            message: `Unexpected error in OPTIONS handler: ${error instanceof Error ? error.message : String(error)}`
        });
        return new NextResponse(null, { status: 500 });
    }
}

/**
 * Main GET handler for the auth callback.
 * Exchanges the OAuth code for a session and redirects the user.
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // 1. Bot Protection
    try {
        const { isBot } = await checkBotId();
        if (isBot) {
            await insertAuditLog({
                eventType: 'security',
                severity: 'warn',
                message: `Bot detected on auth callback: ${requestUrl.pathname}`,
                ip,
                safeQueryParams: Object.fromEntries(requestUrl.searchParams)
            });
            return new Response("Bot detected", { status: 403 });
        }
    } catch (error) {
        await insertAuditLog({
            eventType: 'security',
            severity: 'error',
            message: `BotId check failed: ${error instanceof Error ? error.message : String(error)}`,
            ip
        });
        // Fall back to safe default (allow) so the auth callback does not crash
    }

    // 2. Request Validation
    const params = Object.fromEntries(requestUrl.searchParams);
    const validation = callbackSchema.safeParse(params);

    if (!validation.success) {
        await insertAuditLog({
            eventType: 'auth',
            severity: 'warn',
            message: `Invalid callback parameters: ${JSON.stringify(validation.error.format())}`,
            ip,
            safeQueryParams: params
        });
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const { code, next: rawNextInput } = validation.data;

    // 3. Redirect Validation (Strict)
    // Normalize and strictly validate the incoming redirect value
    let next = '/';
    if (rawNextInput) {
        // Decode and trim
        const decodedNext = decodeURIComponent(rawNextInput).trim();

        // Block control characters, embedded nulls, multiple slashes at start, or absolute URLs
        const hasControlChars = /[\x00-\x1F\x7F]/.test(decodedNext);
        const isAbsolute = /:\/\/|^\/\/|^\s*javascript:/i.test(decodedNext);

        if (!hasControlChars && !isAbsolute && decodedNext.startsWith('/') && !decodedNext.startsWith('//')) {
            next = decodedNext;
        } else {
            await insertAuditLog({
                eventType: 'security',
                severity: 'warn',
                message: `Potentially malicious 'next' parameter rejected: ${decodedNext}`,
                ip,
                safeQueryParams: params
            });
        }
    }

    // 3. Authentication Exchange
    try {
        const supabase = await createClient();
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            await insertAuditLog({
                eventType: 'auth',
                severity: 'error',
                message: `Failed code exchange: ${exchangeError.message}`,
                ip,
                safeQueryParams: params
            });
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        if (data.session) {
            const userId = data.session.user.id;
            await insertAuditLog({
                eventType: 'auth',
                severity: 'info',
                message: `Successful authentication for user: ${userId}`,
                userId,
                ip
            });

            let finalRedirect = next;

            if (next === '/') {
                // Check user profile for onboarding status
                const { data: profile, error: profileError } = await supabase
                    .from("users")
                    .select("onboarding_completed")
                    .eq("id", userId)
                    .single();

                if (profileError) {
                    await insertAuditLog({
                        eventType: 'system',
                        severity: 'error',
                        message: `Error fetching user profile during callback: ${profileError.message}`,
                        userId,
                        ip
                    });
                }

                if (profile?.onboarding_completed) {
                    finalRedirect = "/dashboard";
                } else {
                    finalRedirect = "/onboarding";
                }

                await insertAuditLog({
                    eventType: 'auth',
                    severity: 'info',
                    message: `Redirecting user ${userId} to ${finalRedirect} (Onboarding completed: ${profile?.onboarding_completed})`,
                    userId,
                    ip
                });
            } else {
                await insertAuditLog({
                    eventType: 'auth',
                    severity: 'info',
                    message: `Redirecting user ${userId} to explicit next: ${finalRedirect}`,
                    userId,
                    ip
                });
            }

            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${finalRedirect}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${finalRedirect}`);
            } else {
                return NextResponse.redirect(`${origin}${finalRedirect}`);
            }
        }
    } catch (error) {
        await insertAuditLog({
            eventType: 'system',
            severity: 'error',
            message: `Unexpected error in auth callback exchange: ${error instanceof Error ? error.message : String(error)}`,
            ip
        });
        return new Response("Internal Server Error", { status: 500 });
    }

    // fallback for unexpected path (e.g. no session returned)
    await insertAuditLog({
        eventType: 'system',
        severity: 'warn',
        message: 'Auth callback fallback: no session returned from exchange',
        ip,
        safeQueryParams: params
    });
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
