import { db } from "@/server/db"; // Fixed import path
import { sysUserRoles, sysRoles } from "@/shared/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if a user has a specific system role.
 * @param userId The user's ID
 * @param roleName The name of the role (e.g., 'super_admin')
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
    const result = await db
        .select()
        .from(sysUserRoles)
        .innerJoin(sysRoles, eq(sysUserRoles.roleId, sysRoles.id))
        .where(eq(sysUserRoles.userId, userId));

    return result.some((r) => r.sys_roles.name === roleName);
}

/**
 * Checks if a user is a System Administrator.
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
    return hasRole(userId, "super_admin");
}
