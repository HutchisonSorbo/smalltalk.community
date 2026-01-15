/**
 * Role-based Permissions System
 * Defines and checks permissions for CommunityOS features
 */

import type { TenantRole } from "@/shared/schema";

/**
 * Available permissions in CommunityOS
 */
export type Permission =
    // CRM
    | "crm:view"
    | "crm:edit"
    | "crm:delete"
    | "crm:export"
    // Events
    | "events:view"
    | "events:create"
    | "events:edit"
    | "events:delete"
    // Financial
    | "financial:view"
    | "financial:edit"
    | "financial:approve"
    // Governance
    | "governance:view"
    | "governance:edit"
    | "governance:admin"
    // Settings
    | "settings:view"
    | "settings:edit"
    | "settings:branding"
    // Members
    | "members:view"
    | "members:invite"
    | "members:manage_roles"
    | "members:remove"
    // General
    | "app:access"
    | "insights:view"
    | "insights:query"
    | "reports:view"
    | "reports:export";

/**
 * Permission definitions by role
 * Higher roles inherit all permissions from lower roles
 */
const rolePermissions: Record<TenantRole, Permission[]> = {
    member: [
        "app:access",
        "crm:view",
        "events:view",
        "events:create",
        "insights:view",
        "reports:view",
    ],
    board: [
        // Inherits all member permissions (added programmatically)
        "crm:edit",
        "crm:export",
        "events:edit",
        "events:delete",
        "financial:view",
        "governance:view",
        "insights:query",
        "reports:export",
        "members:view",
        "members:invite",
        "settings:view",
    ],
    admin: [
        // Inherits all board permissions (added programmatically)
        "crm:delete",
        "financial:edit",
        "financial:approve",
        "governance:edit",
        "governance:admin",
        "settings:edit",
        "settings:branding",
        "members:manage_roles",
        "members:remove",
    ],
};

/**
 * Get all permissions for a role (including inherited)
 */
export function getRolePermissions(role: TenantRole): Permission[] {
    const permissions = new Set<Permission>();

    // Add member permissions first (base level)
    rolePermissions.member.forEach((p) => permissions.add(p));

    // Add board permissions if role is board or admin
    if (role === "board" || role === "admin") {
        rolePermissions.board.forEach((p) => permissions.add(p));
    }

    // Add admin permissions if role is admin
    if (role === "admin") {
        rolePermissions.admin.forEach((p) => permissions.add(p));
    }

    return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: TenantRole, permission: Permission): boolean {
    const permissions = getRolePermissions(role);
    return permissions.includes(permission);
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: TenantRole, permissions: Permission[]): boolean {
    return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: TenantRole, permissions: Permission[]): boolean {
    return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get permissions grouped by category for UI display
 */
export function getPermissionCategories(): Record<string, Permission[]> {
    return {
        "CRM & Contacts": ["crm:view", "crm:edit", "crm:delete", "crm:export"],
        "Events & Programs": ["events:view", "events:create", "events:edit", "events:delete"],
        "Financial Management": ["financial:view", "financial:edit", "financial:approve"],
        "Governance": ["governance:view", "governance:edit", "governance:admin"],
        "Settings": ["settings:view", "settings:edit", "settings:branding"],
        "Member Management": ["members:view", "members:invite", "members:manage_roles", "members:remove"],
        "Insights & Reports": ["insights:view", "insights:query", "reports:view", "reports:export"],
    };
}

/**
 * Get human-readable label for a permission
 */
export function getPermissionLabel(permission: Permission): string {
    const labels: Record<Permission, string> = {
        "crm:view": "View contacts",
        "crm:edit": "Edit contacts",
        "crm:delete": "Delete contacts",
        "crm:export": "Export contacts",
        "events:view": "View events",
        "events:create": "Create events",
        "events:edit": "Edit events",
        "events:delete": "Delete events",
        "financial:view": "View finances",
        "financial:edit": "Edit finances",
        "financial:approve": "Approve transactions",
        "governance:view": "View governance",
        "governance:edit": "Edit governance",
        "governance:admin": "Manage governance",
        "settings:view": "View settings",
        "settings:edit": "Edit settings",
        "settings:branding": "Manage branding",
        "members:view": "View members",
        "members:invite": "Invite members",
        "members:manage_roles": "Manage roles",
        "members:remove": "Remove members",
        "app:access": "Access apps",
        "insights:view": "View insights",
        "insights:query": "Query AI insights",
        "reports:view": "View reports",
        "reports:export": "Export reports",
    };

    return labels[permission] || permission;
}
