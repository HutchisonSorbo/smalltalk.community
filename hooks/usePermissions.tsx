/**
 * usePermissions Hook
 * Provides permission checking for CommunityOS React components
 */

"use client";

import { useMemo } from "react";
import { useTenant } from "@/components/communityos/TenantProvider";
import {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getRolePermissions,
    type Permission,
} from "@/lib/communityos/permissions";

export interface UsePermissionsResult {
    /**
     * Current user's role in the tenant
     */
    role: string | null;

    /**
     * All permissions the user has
     */
    permissions: Permission[];

    /**
     * Check if user has a specific permission
     */
    can: (permission: Permission) => boolean;

    /**
     * Check if user has all of the specified permissions
     */
    canAll: (permissions: Permission[]) => boolean;

    /**
     * Check if user has any of the specified permissions
     */
    canAny: (permissions: Permission[]) => boolean;

    /**
     * Convenience checks for common permissions
     */
    isAdmin: boolean;
    isBoardOrAbove: boolean;
    canManageSettings: boolean;
    canManageMembers: boolean;
    canAccessFinancials: boolean;
}

/**
 * Hook for checking permissions in CommunityOS components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { can, isAdmin } = usePermissions();
 *   
 *   if (!can("crm:edit")) {
 *     return <p>You don't have permission to edit contacts.</p>;
 *   }
 *   
 *   return <EditContactForm />;
 * }
 * ```
 */
export function usePermissions(): UsePermissionsResult {
    const { userRole, isAdmin, isBoardOrAbove } = useTenant();

    const permissions = useMemo(() => {
        if (!userRole) return [];
        return getRolePermissions(userRole);
    }, [userRole]);

    const can = useMemo(
        () => (permission: Permission) => {
            if (!userRole) return false;
            return hasPermission(userRole, permission);
        },
        [userRole]
    );

    const canAll = useMemo(
        () => (perms: Permission[]) => {
            if (!userRole) return false;
            return hasAllPermissions(userRole, perms);
        },
        [userRole]
    );

    const canAny = useMemo(
        () => (perms: Permission[]) => {
            if (!userRole) return false;
            return hasAnyPermission(userRole, perms);
        },
        [userRole]
    );

    return {
        role: userRole,
        permissions,
        can,
        canAll,
        canAny,
        isAdmin,
        isBoardOrAbove,
        canManageSettings: hasPermission(userRole ?? "member", "settings:edit"),
        canManageMembers: hasPermission(userRole ?? "member", "members:manage_roles"),
        canAccessFinancials: hasPermission(userRole ?? "member", "financial:view"),
    };
}

/**
 * Component for conditional rendering based on permissions
 */
interface RequirePermissionProps {
    permission: Permission | Permission[];
    mode?: "all" | "any";
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function RequirePermission({
    permission,
    mode = "all",
    children,
    fallback = null,
}: RequirePermissionProps) {
    const { can, canAll, canAny } = usePermissions();

    const hasAccess = Array.isArray(permission)
        ? mode === "all"
            ? canAll(permission)
            : canAny(permission)
        : can(permission);

    if (!hasAccess) {
        return fallback;
    }

    return children;
}
