import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkBotId } from "botid/server";

// Validates the OAuth callback parameters
const callbackSchema = z.object({
    code: z.string().min(1),
    next: z.string().optional().default('/'),
});

// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase-server'

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
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
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;

    // 1. Bot Protection
    try {
        const { isBot } = await checkBotId(request);
        if (isBot) {
            // Redact sensitive query parameters (like OAuth codes) from logs
            console.warn(`[AUTH_AUDIT] Bot detected on auth callback: ${requestUrl.pathname}`);
            return new Response("Bot detected", { status: 403 });
        }
    } catch (error) {
        console.error(`[AUTH_AUDIT] BotId check failed:`, error);
        // Fall back to safe default (allow) so the auth callback does not crash
    }

    // 2. Request Validation
    const params = Object.fromEntries(requestUrl.searchParams);
    const validation = callbackSchema.safeParse(params);

    if (!validation.success) {
        console.warn(`[AUTH_AUDIT] Invalid callback parameters:`, validation.error.format());
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const { code, next: rawNext } = validation.data;
    // Validate that next is a relative path to prevent open redirects
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

    // 3. Authentication Exchange
    try {
        const supabase = await createClient();
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error(`[AUTH_AUDIT] Failed code exchange: ${exchangeError.message}`);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        if (data.session) {
            console.log(`[AUTH_AUDIT] Successful authentication for user: ${data.session.user.id}`);

            let finalRedirect = next;

            if (next === '/') {
                // Check user profile for onboarding status
                const { data: profile, error: profileError } = await supabase
                    .from("users")
                    .select("onboarding_completed")
                    .eq("id", data.session.user.id)
                    .single();

                if (profileError) {
                    console.error(`[AUTH_AUDIT] Error fetching user profile:`, profileError);
                }

                if (profile?.onboarding_completed) {
                    finalRedirect = "/dashboard";
                } else {
                    finalRedirect = "/onboarding";
                }
                console.log(`[AUTH_AUDIT] Redirecting user ${data.session.user.id} to ${finalRedirect} (Onboarding completed: ${profile?.onboarding_completed})`);
            } else {
                console.log(`[AUTH_AUDIT] Redirecting user ${data.session.user.id} to explicit next: ${finalRedirect}`);
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
        console.error(`[AUTH_AUDIT] Unexpected error in auth callback:`, error);
        return new Response("Internal Server Error", { status: 500 });
    }

    // fallback for unexpected path
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
