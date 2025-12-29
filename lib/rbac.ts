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
/**
 * Checks if a user is a System Administrator.
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
    return hasRole(userId, "super_admin");
}

/**
 * Gets all system roles for a user.
 */
export async function getUserRoles(userId: string): Promise<string[]> {
    const result = await db
        .select({ roleName: sysRoles.name })
        .from(sysUserRoles)
        .innerJoin(sysRoles, eq(sysUserRoles.roleId, sysRoles.id))
        .where(eq(sysUserRoles.userId, userId));

    return result.map(r => r.roleName);
}


// CodeRabbit Audit Trigger
