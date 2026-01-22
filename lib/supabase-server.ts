import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(useServiceRole = false) {
    const cookieStore = await cookies()

    let supabaseKey: string;
    if (useServiceRole) {
        if (!process.env.SUPABASE_SERVICE_KEY) {
            throw new Error('[CRITICAL] SUPABASE_SERVICE_KEY is missing. Audit logging and server-side operations cannot proceed.');
        }
        supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    } else {
        supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                        console.error('Error setting cookie', name, error)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

// CodeRabbit Audit Trigger
