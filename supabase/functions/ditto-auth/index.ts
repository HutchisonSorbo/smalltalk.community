/**
 * Ditto Authentication Webhook
 * Supabase Edge Function that validates users for Ditto offline sync
 * 
 * This webhook is called by Ditto when a user attempts to sync.
 * It validates the user's Supabase session and returns their permissions.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ditto-client-id",
};

interface DittoAuthRequest {
    token: string; // Supabase access token from the client
    clientId: string;
}

interface DittoAuthResponse {
    authenticated: boolean;
    userId?: string;
    permissions?: {
        read: string[]; // Collection patterns the user can read
        write: string[]; // Collection patterns the user can write
    };
    expiresAt?: number; // Unix timestamp
    error?: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase environment variables");
            return new Response(
                JSON.stringify({ authenticated: false, error: "Server configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse the Ditto auth request
        const body: DittoAuthRequest = await req.json();
        const { token, clientId } = body;

        if (!token) {
            return new Response(
                JSON.stringify({ authenticated: false, error: "No token provided" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create Supabase client with the user's token to verify their session
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the user's JWT token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error("Auth error:", authError?.message);
            return new Response(
                JSON.stringify({ authenticated: false, error: "Invalid or expired token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch user's tenant memberships to determine permissions
        const { data: memberships, error: membershipError } = await supabase
            .from("tenant_members")
            .select("tenant_id, role")
            .eq("user_id", user.id);

        if (membershipError) {
            console.error("Membership lookup error:", membershipError.message);
            return new Response(
                JSON.stringify({ authenticated: false, error: "Failed to verify permissions" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Build permission patterns based on tenant memberships
        // Format: "tenantId:collectionName"
        const readPatterns: string[] = [];
        const writePatterns: string[] = [];

        for (const membership of memberships || []) {
            const tenantId = membership.tenant_id;
            const role = membership.role;

            // All members can read all collections in their tenant
            readPatterns.push(`${tenantId}:*`);

            // Write permissions based on role
            if (role === "admin") {
                // Admins can write to all collections
                writePatterns.push(`${tenantId}:*`);
            } else if (role === "board") {
                // Board members can write to most collections except settings
                writePatterns.push(`${tenantId}:crm`);
                writePatterns.push(`${tenantId}:events`);
                writePatterns.push(`${tenantId}:financial`);
                writePatterns.push(`${tenantId}:governance`);
                writePatterns.push(`${tenantId}:projects`);
                writePatterns.push(`${tenantId}:rostering`);
            } else {
                // Regular members have limited write access
                writePatterns.push(`${tenantId}:crm`);
                writePatterns.push(`${tenantId}:events`);
                writePatterns.push(`${tenantId}:rostering`);
            }
        }

        // Set expiration to 1 hour from now
        const expiresAt = Math.floor(Date.now() / 1000) + 3600;

        const response: DittoAuthResponse = {
            authenticated: true,
            userId: user.id,
            permissions: {
                read: readPatterns,
                write: writePatterns,
            },
            expiresAt,
        };

        console.log(`Ditto auth successful for user ${user.id}, clientId: ${clientId}`);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Ditto auth webhook error:", error);
        return new Response(
            JSON.stringify({ authenticated: false, error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
