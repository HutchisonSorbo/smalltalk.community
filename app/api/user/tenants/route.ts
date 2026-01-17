/**
 * User Tenants API Route
 * Returns all CommunityOS tenants the authenticated user belongs to
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getUserTenants } from "@/lib/communityos/tenant-context";

/**
 * GET /api/user/tenants
 * Returns an array of tenant memberships for the authenticated user
 */
export async function GET() {
    try {
        // Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user's tenant memberships
        const memberships = await getUserTenants(user.id);

        // Transform to a cleaner response format
        const tenants = memberships.map((membership) => ({
            tenant: {
                id: membership.tenant.id,
                code: membership.tenant.code,
                name: membership.tenant.name,
                logoUrl: membership.tenant.logoUrl,
                primaryColor: membership.tenant.primaryColor,
                description: membership.tenant.description,
            },
            role: membership.role,
            joinedAt: membership.joinedAt,
        }));

        return NextResponse.json({ tenants });
    } catch (error) {
        console.error("[API] Error fetching user tenants:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
