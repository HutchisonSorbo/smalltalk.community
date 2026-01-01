import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { storage } from '@/server/storage'

async function syncUserToStorage(user: any) {
    if (!user) return;
    const metadata = user.user_metadata || {};
    await storage.upsertUser({
        id: user.id,
        email: user.email,
        userType: metadata.user_type || 'individual',
        accountType: metadata.account_type || 'Individual',
        organisationName: metadata.organisation_name,
        dateOfBirth: metadata.date_of_birth ? new Date(metadata.date_of_birth) : undefined
    });
}

function getRedirectUrl(request: Request, origin: string, next: string) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
        return `${origin}${next}`
    } else if (forwardedHost) {
        return `https://${forwardedHost}${next}`
    } else {
        return `${origin}${next}`
    }
}

function getErrorRedirect(origin: string, error: any) {
    // Handle PKCE cross-device issue
    if (error.code === 'invalid_grant' || error.message?.includes('code verifier')) {
        return `${origin}/login?error=cross_device_verification&error_description=${encodeURIComponent("Please open this link on the same device/browser where you signed up.")}`
    }
    return `${origin}/login?error=${encodeURIComponent(error.name || 'server_error')}&error_description=${encodeURIComponent(error.message || "Unknown error")}`
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        console.error('Auth callback missing code. Full URL:', request.url);
        return NextResponse.redirect(`${origin}/login?error=auth_code_missing&error_description=No+code+provided`)
    }

    const supabase = await createClient()
    try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth code exchange error:', error)
            return NextResponse.redirect(getErrorRedirect(origin, error))
        }

        // Happy path: Sync user and redirect
        const { data: { user } } = await supabase.auth.getUser();
        await syncUserToStorage(user);

        const redirectUrl = getRedirectUrl(request, origin, next);
        return NextResponse.redirect(redirectUrl)

    } catch (err: any) {
        console.error('Auth callback exception:', err)
        return NextResponse.redirect(getErrorRedirect(origin, err))
    }
}

// CodeRabbit Audit Trigger
