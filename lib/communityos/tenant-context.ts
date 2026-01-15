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
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tenant_members")
        .select(`
      *,
      tenant:tenants(*)
    `)
        .eq("user_id", userId);

    if (error || !data) return [];
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

