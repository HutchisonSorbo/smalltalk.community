import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a server-side Supabase client using either the service role key or the public anon key.
 * This client is configured to use Next.js cookies for session management.
 * 
 * @param {boolean} [useServiceRole=false] - Whether to use the SUPABASE_SERVICE_KEY instead of the public anon key. 
 *                                           Set to true to bypass Row Level Security (RLS) for server-side operations (e.g., audit logging).
 * 
 * @returns {Promise<ReturnType<typeof createServerClient>>} A promise that resolves to a Supabase client instance.
 * 
 * @throws {Error} Throws a critical error if `useServiceRole` is true but the `SUPABASE_SERVICE_KEY` environment variable is missing or empty.
 * 
 * @remarks
 * This function has side effects:
 * - It calls `cookies()` from `next/headers`, which makes the current route dynamic.
 * - It may throw an error if environment variables are misconfigured.
 */
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
                    } catch (_error) {
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
