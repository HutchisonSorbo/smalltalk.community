/**
 * Multi-tenant Isolation Utilities
 */

interface TenantMember {
    id: string;
    tenantId: string;
    name: string;
}

/**
 * Validates that the requested tenant ID matches the member's assigned tenant.
 * Prevents cross-tenant data access.
 * 
 * @param {string} tenantId - The tenant ID being accessed.
 * @param {string} memberTenantId - The authenticated member's tenant ID.
 * @throws {Error} If inputs are invalid or IDs do not match.
 */
export function validateTenantAccess(tenantId: string, memberTenantId: string): void {
    if (!tenantId || !tenantId.trim()) {
        throw new Error("Invalid tenantId");
    }
    if (!memberTenantId || !memberTenantId.trim()) {
        throw new Error("Invalid memberTenantId");
    }

    if (tenantId !== memberTenantId) {
        throw new Error("Cross-tenant access denied");
    }
}

/**
 * Retrieves members for a specific tenant.
 * 
 * @param {string} tenantId - The tenant ID to fetch members for.
 * @returns {Promise<TenantMember[]>} A list of members belonging to the tenant.
 */
export async function getTenantMembers(tenantId: string): Promise<TenantMember[]> {
    // This should be replaced with a real DB query using Supabase/Drizzle
    // e.g., return db.select().from(members).where(eq(members.tenantId, tenantId));

    // Returning empty array as default safe failure state until DB is connected
    return [];
}
