/**
 * CommunityOS Tenant Providers Wrapper
 * 
 * Client component that wraps children with TenantProvider and DittoProvider
 * This is used by the layout to provide context without making the layout a client component
 */

"use client";

import { TenantProvider } from "./TenantProvider";
import { DittoProvider } from "./DittoProvider";
import type { Tenant, TenantRole } from "@/shared/schema";

interface TenantProvidersProps {
    children: React.ReactNode;
    tenant: Tenant;
    userRole: TenantRole;
}

/**
 * Combines TenantProvider and DittoProvider for CommunityOS pages
 */
export function TenantProviders({ children, tenant, userRole }: TenantProvidersProps) {
    return (
        <TenantProvider tenant={tenant} userRole={userRole}>
            <DittoProvider tenantId={tenant.id}>
                {children}
            </DittoProvider>
        </TenantProvider>
    );
}
