/**
 * CommunityOS Tenant Layout
 * Wraps all tenant pages with TenantProvider and handles tenant verification
 */

import { redirect, notFound } from "next/navigation";
import { TenantProvider } from "@/components/communityos/TenantProvider";
import { getTenantByCode, verifyTenantAccess } from "@/lib/communityos/tenant-context";
import { createClient } from "@/lib/supabase-server";
import type { TenantRole } from "@/shared/schema";

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantId: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
    const { tenantId: tenantCode } = await params;

    // Fetch tenant by code
    const tenant = await getTenantByCode(tenantCode);
    if (!tenant) {
        notFound();
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/communityos/${tenantCode}/dashboard`);
    }

    // Verify tenant access
    const { hasAccess, role } = await verifyTenantAccess(user.id, tenant.id);

    if (!hasAccess) {
        // User doesn't have access to this tenant
        // Redirect to a page where they can request access
        redirect(`/communityos/access-denied?tenant=${tenantCode}`);
    }

    return (
        <TenantProvider tenant={tenant} userRole={role as TenantRole}>
            <div className="min-h-screen">
                {/* Tenant Header */}
                <header
                    className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80"
                    style={{ borderColor: "var(--tenant-primary, #4F46E5)" }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            {tenant.logoUrl && (
                                <img
                                    src={tenant.logoUrl}
                                    alt={tenant.name}
                                    className="h-8 w-auto"
                                />
                            )}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {tenant.name}
                            </span>
                        </div>
                        <nav className="flex items-center gap-4">
                            <a
                                href={`/communityos/${tenantCode}/dashboard`}
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                Dashboard
                            </a>
                            <a
                                href="/dashboard"
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                My Account
                            </a>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl p-4">{children}</main>

                {/* Tenant Footer */}
                <footer className="mt-auto border-t bg-gray-50 py-4 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
                        <p>
                            Powered by{" "}
                            <a
                                href="https://smalltalk.community"
                                className="font-medium"
                                style={{ color: "var(--tenant-primary, #4F46E5)" }}
                            >
                                CommunityOS
                            </a>
                        </p>
                    </div>
                </footer>
            </div>
        </TenantProvider>
    );
}

export async function generateMetadata({ params }: TenantLayoutProps) {
    const { tenantId: tenantCode } = await params;
    const tenant = await getTenantByCode(tenantCode);

    if (!tenant) {
        return { title: "Not Found" };
    }

    return {
        title: {
            template: `%s | ${tenant.name}`,
            default: tenant.name,
        },
        description: tenant.description ?? `${tenant.name} - Powered by CommunityOS`,
    };
}
