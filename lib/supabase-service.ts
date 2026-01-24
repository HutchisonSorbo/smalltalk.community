/**
 * Server-side Supabase client with SERVICE ROLE permissions
 * Use this for privileged operations that need to bypass RLS
 * 
 * WARNING: Never expose this client to the browser
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
