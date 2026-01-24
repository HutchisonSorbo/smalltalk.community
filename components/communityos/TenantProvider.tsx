"use client";

/**
 * CommunityOS Tenant Provider
 * Provides tenant context to all CommunityOS components
 */

import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { Tenant, TenantRole } from "@/shared/schema";

interface TenantContextValue {
    tenant: Tenant | null;
    userRole: TenantRole | null;
    isAdmin: boolean;
    isBoardOrAbove: boolean;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
    tenant: null,
    userRole: null,
    isAdmin: false,
    isBoardOrAbove: false,
    isLoading: true,
});

interface TenantProviderProps {
    children: React.ReactNode;
    tenant: Tenant | null;
    userRole: TenantRole | null;
}

/**
 * TenantProvider wraps CommunityOS pages to provide tenant context
 * Tenant data is fetched server-side and passed as props
 */
export function TenantProvider({
    children,
    tenant,
    userRole,
}: TenantProviderProps) {
    // Inject tenant theme as CSS custom properties
    useEffect(() => {
        if (tenant) {
            document.documentElement.style.setProperty(
                "--tenant-primary",
                tenant.primaryColor ?? "#4F46E5"
            );
            document.documentElement.style.setProperty(
                "--tenant-secondary",
                tenant.secondaryColor ?? "#818CF8"
            );
        }

        return () => {
            // Cleanup on unmount
            document.documentElement.style.removeProperty("--tenant-primary");
            document.documentElement.style.removeProperty("--tenant-secondary");
        };
    }, [tenant]);

    const value = useMemo<TenantContextValue>(
        () => ({
            tenant,
            userRole,
            isAdmin: userRole === "admin",
            isBoardOrAbove: userRole === "admin" || userRole === "board",
            isLoading: false,
        }),
        [tenant, userRole]
    );

    return (
        <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
    );
}

/**
 * Hook to access tenant context
 * Must be used within a TenantProvider
 */
export function useTenant(): TenantContextValue {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}

/**
 * Hook to get the current tenant
 * Throws if no tenant is available
 */
export function useRequiredTenant(): Tenant {
    const { tenant } = useTenant();
    if (!tenant) {
        throw new Error("No tenant available. Ensure TenantProvider has a tenant.");
    }
    return tenant;
}

/**
 * Hook to check if current user has admin access
 */
export function useIsAdmin(): boolean {
    const { isAdmin } = useTenant();
    return isAdmin;
}

/**
 * Hook to check if current user has board-level or higher access
 */
export function useIsBoardOrAbove(): boolean {
    const { isBoardOrAbove } = useTenant();
    return isBoardOrAbove;
}
