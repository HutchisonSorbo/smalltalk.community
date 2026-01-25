/**
 * CommunityOS Tenant Context Utilities
 * Server-side functions for tenant management and access verification
 */

import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-service";
import type { Tenant, TenantMember, TenantRole } from "@/shared/schema";

/**
 * Fetch a tenant by its URL code/slug
 * @param code - The tenant's URL slug (e.g., 'stc' for smalltalk.community Inc)
 * @returns The tenant or null if not found
 */
export async function getTenantByCode(code: string): Promise<Tenant | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("code", code)
        .single();

    if (error || !data) return null;
    return data as Tenant;
}

/**
 * Public-facing subset of Tenant fields returned by getPublicTenantByCode.
 * Only includes fields safe and relevant for public profile display.
 */
export type PublicTenant = Pick<
    Tenant,
    | "id"
    | "code"
    | "name"
    | "logoUrl"
    | "primaryColor"
    | "secondaryColor"
    | "description"
    | "website"
    | "heroImageUrl"
    | "missionStatement"
    | "socialLinks"
    | "contactEmail"
    | "contactPhone"
    | "address"
    | "isPublic"
    | "impactStats"
    | "programs"
    | "teamMembers"
    | "gallery"
    | "testimonials"
    | "ctas"
    | "events"
>;

/**
 * Fetch a public tenant by its URL code/slug (no auth required)
 * Used for public profile pages at /org/[code]
 *
 * NOTE: This function uses the Supabase client (not Drizzle) intentionally.
 * The RLS policy "tenants_public_read" restricts SELECTs to rows where
 * is_public = true, providing defense-in-depth security at the database level.
 * This ensures that even if the application code has bugs, non-public tenants
 * cannot be retrieved via this query path.
 *
 * @param code - The tenant's URL slug (e.g., 'stc' for smalltalk.community Inc)
 * @returns The public tenant or null if not found, not public, or invalid input
 */
export async function getPublicTenantByCode(code: string): Promise<PublicTenant | null> {
    // Input validation
    if (typeof code !== "string" || code.trim() === "") {
        return null;
    }

    // Sanitize code for logging (prevent log injection, limit length)
    const safeCode = code
        .slice(0, 50)
        .replace(/[\r\n\t]/g, "")
        .replace(/[^\w\-_.]/g, "_");

    // Explicit list of public profile columns (not select *)
    const publicColumns = [
        "id",
        "code",
        "name",
        "logo_url",
        "primary_color",
        "description",
        "website",
        "hero_image_url",
        "mission_statement",
        "social_links",
        "contact_email",
        "contact_phone",
        "address",
        "is_public",
        "impact_stats",
        "programs",
        "team_members",
        "gallery",
        "testimonials",
        "ctas",
        "events",
    ].join(", ");

    try {
        // Use Supabase client for RLS enforcement (see docstring above)
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tenants")
            .select(publicColumns)
            .eq("code", code.trim())
            .eq("is_public", true)
            .single();

        if (error) {
            console.error(`[getPublicTenantByCode] Database error for code "${safeCode}":`, error.message);
            return null;
        }

        if (!data) return null;

        return mapDbRowToPublicTenant(data);
    } catch (err) {
        console.error(`[getPublicTenantByCode] Unexpected error for code "${safeCode}":`, err);
        return null;
    }
}

/**
 * Maps a database row to a PublicTenant object
 * Ensures all snake_case columns are mapped to camelCase properties
 * and socialLinks is safely handled as an object.
 */
function mapDbRowToPublicTenant(data: any): PublicTenant {
    return {
        id: data.id,
        code: data.code,
        name: data.name,
        logoUrl: data.logo_url ?? null,
        primaryColor: data.primary_color ?? null,
        secondaryColor: data.secondary_color ?? null,
        description: data.description ?? null,
        website: data.website ?? null,
        heroImageUrl: data.hero_image_url ?? null,
        missionStatement: data.mission_statement ?? null,
        socialLinks: (data.social_links ?? {}) as Record<string, string>,
        contactEmail: data.contact_email ?? null,
        contactPhone: data.contact_phone ?? null,
        address: data.address ?? null,
        isPublic: !!data.is_public,
        impactStats: (data.impact_stats ?? []) as any[],
        programs: (data.programs ?? []) as any[],
        teamMembers: (data.team_members ?? []) as any[],
        gallery: (data.gallery ?? []) as any[],
        testimonials: (data.testimonials ?? []) as any[],
        ctas: (data.ctas ?? []) as any[],
        events: (data.events ?? []) as any[],
    };
}

/**
 * Fetch a tenant by its ID
 * @param id - The tenant's UUID
 * @returns The tenant or null if not found
 */
export async function getTenantById(id: string): Promise<Tenant | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return null;
    return data as Tenant;
}

/**
 * Get all tenants a user belongs to
 * @param userId - The user's ID
 * @returns Array of tenant memberships with tenant details
 */
export async function getUserTenants(userId: string): Promise<(TenantMember & { tenant: Tenant })[]> {
    console.log(`[getUserTenants] Fetching tenants for user: ${userId}`);
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .select(`
      *,
      tenant:tenants(*)
    `)
        .eq("user_id", userId);

    if (error) {
        console.error(`[getUserTenants] Error fetching memberships:`, error.message);
        return [];
    }

    if (!data) {
        console.log(`[getUserTenants] No memberships found for user: ${userId}`);
        return [];
    }

    console.log(`[getUserTenants] Found ${data.length} memberships for user: ${userId}`);
    return data as (TenantMember & { tenant: Tenant })[];
}

/**
 * Get a user's membership in a specific tenant
 * @param userId - The user's ID
 * @param tenantId - The tenant's ID
 * @returns The membership or null if user is not a member
 */
export async function getTenantMembership(
    userId: string,
    tenantId: string
): Promise<TenantMember | null> {
    // Use service role client to bypass RLS for membership lookups
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .select("*")
        .eq("user_id", userId)
        .eq("tenant_id", tenantId)
        .single();

    if (error || !data) return null;
    return data as TenantMember;
}

/**
 * Verify if a user has access to a tenant
 * @param userId - The user's ID
 * @param tenantId - The tenant's ID
 * @returns Object with access status and role if member
 */
export async function verifyTenantAccess(
    userId: string,
    tenantId: string
): Promise<{ hasAccess: boolean; role?: TenantRole }> {
    const membership = await getTenantMembership(userId, tenantId);

    if (!membership) {
        return { hasAccess: false };
    }

    return {
        hasAccess: true,
        role: membership.role as TenantRole,
    };
}

/**
 * Check if a user has admin access to a tenant
 * @param userId - The user's ID
 * @param tenantId - The tenant's ID
 * @returns True if user is an admin of the tenant
 */
export async function isTenantAdmin(
    userId: string,
    tenantId: string
): Promise<boolean> {
    const { hasAccess, role } = await verifyTenantAccess(userId, tenantId);
    return hasAccess && role === "admin";
}

/**
 * Check if a user has board-level or higher access to a tenant
 * @param userId - The user's ID
 * @param tenantId - The tenant's ID
 * @returns True if user is admin or board member
 */
export async function isTenantBoardOrAbove(
    userId: string,
    tenantId: string
): Promise<boolean> {
    const { hasAccess, role } = await verifyTenantAccess(userId, tenantId);
    return hasAccess && (role === "admin" || role === "board");
}

/**
 * Get all members of a tenant
 * @param tenantId - The tenant's ID
 * @returns Array of tenant members
 */
export async function getTenantMembers(tenantId: string): Promise<TenantMember[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .select("*")
        .eq("tenant_id", tenantId);

    if (error || !data) return [];
    return data as TenantMember[];
}

/**
 * Add a user to a tenant
 * @param tenantId - The tenant's ID
 * @param userId - The user's ID
 * @param role - The role to assign (default: 'member')
 * @param invitedBy - The ID of the user who invited them (optional)
 * @returns The created membership or null on error
 */
export async function addTenantMember(
    tenantId: string,
    userId: string,
    role: TenantRole = "member",
    invitedBy?: string
): Promise<TenantMember | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .insert({
            tenant_id: tenantId,
            user_id: userId,
            role,
            invited_by: invitedBy,
        })
        .select()
        .single();

    if (error || !data) return null;
    return data as TenantMember;
}

/**
 * Update a tenant member's role
 * @param tenantId - The tenant's ID
 * @param userId - The user's ID
 * @param newRole - The new role to assign
 * @returns The updated membership or null on error
 */
export async function updateTenantMemberRole(
    tenantId: string,
    userId: string,
    newRole: TenantRole
): Promise<TenantMember | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .update({ role: newRole })
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .select()
        .single();

    if (error || !data) return null;
    return data as TenantMember;
}

/**
 * Remove a user from a tenant
 * @param tenantId - The tenant's ID
 * @param userId - The user's ID
 * @returns True if the member was removed
 */
export async function removeTenantMember(
    tenantId: string,
    userId: string
): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("tenant_members")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("user_id", userId);

    return !error;
}

