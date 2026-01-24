import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const cookieOptions: { maxAge?: number } = {}

    if (typeof window !== 'undefined') {
        const rememberMe = localStorage.getItem('remember_me')
        if (rememberMe === 'true') {
            cookieOptions.maxAge = 60 * 60 * 24 * 30 // 30 days
        }
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
        {
            cookieOptions,
        }
    )
}

// CodeRabbit Audit Trigger
