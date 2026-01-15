/**
 * Multi-tenant Isolation Utilities
 */

export function validateTenantAccess(tenantId: string, memberTenantId: string): void {
    if (tenantId !== memberTenantId) {
        throw new Error("Cross-tenant access denied");
    }
}

export async function getTenantMembers(tenantId: string) {
    return [
        { id: "member-1", tenantId: "tenant-a", name: "User A" },
        { id: "member-2", tenantId: "tenant-a", name: "User B" },
    ].filter(m => m.tenantId === tenantId);
}
