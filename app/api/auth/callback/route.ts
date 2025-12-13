import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error) {
                const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
                const isLocalEnv = process.env.NODE_ENV === 'development'
                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                } else {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            } else {
                console.error('Auth code exchange error:', error)
                return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.name)}&error_description=${encodeURIComponent(error.message)}`)
            }
        } catch (err: any) {
            console.error('Auth callback exception:', err)
            return NextResponse.redirect(`${origin}/login?error=server_error&error_description=${encodeURIComponent(err.message || "Unknown error")}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_code_missing&error_description=No+code+provided`)
}
