import { NextResponse } from 'next/server'
import { checkBotId } from "botid";
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
    await checkBotId();
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const rawNext = searchParams.get('next') ?? '/'
    // Validate that next is a relative path to prevent open redirects
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error(`[AUTH_AUDIT] Failed code exchange: ${error.message}`);
        }

        if (!error && data.session) {
            console.log(`[AUTH_AUDIT] Successful authentication for user: ${data.session.user.id}`);

            // Allow override if "next" was explicitly provided (e.g. from a specific flow), 
            // BUT if next is just "/", check onboarding status.
            let finalRedirect = next;

            if (next === '/') {
                // Check user profile for onboarding status
                const { data: profile } = await supabase
                    .from("users")
                    .select("onboarding_completed")
                    .eq("id", data.session.user.id)
                    .single();

                if (profile?.onboarding_completed) {
                    finalRedirect = "/dashboard";
                } else {
                    finalRedirect = "/onboarding";
                }
                console.log(`[AUTH_AUDIT] Redirecting user ${data.session.user.id} to ${finalRedirect} (Onboarding completed: ${profile?.onboarding_completed})`);
            } else {
                console.log(`[AUTH_AUDIT] Redirecting user ${data.session.user.id} to explicit next: ${finalRedirect}`);
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${finalRedirect}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${finalRedirect}`)
            } else {
                return NextResponse.redirect(`${origin}${finalRedirect}`)
            }
        }
    } else {
        console.warn(`[AUTH_AUDIT] Missing code parameter in callback request`);
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
