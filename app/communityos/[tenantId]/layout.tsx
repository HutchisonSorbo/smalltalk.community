/**
 * CommunityOS Tenant Layout
 * Wraps all tenant pages with TenantProvider and handles tenant verification
 */

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { TenantProviders } from "@/components/communityos/TenantProviders";
import { getTenantByCode, verifyTenantAccess } from "@/lib/communityos/tenant-context";
import { createClient } from "@/lib/supabase-server";
import { safeUrl } from "@/lib/utils";
import type { TenantRole } from "@/shared/schema";

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantId: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
    const { tenantId: tenantCode } = await params;

    let tenant = null;
    let fetchError: Error | null = null;

    try {
        // Fetch tenant by code
        tenant = await getTenantByCode(tenantCode);
    } catch (error) {
        fetchError = error instanceof Error ? error : new Error("Unknown error");
        console.error(`[CommunityOS] Failed to fetch tenant "${tenantCode}":`, error);

        // Log to Sentry
        Sentry.captureException(error, {
            tags: {
                component: "TenantLayout",
                tenantCode
            }
        });
    }

    if (!tenant) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-600">
                        Organisation Not Found
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {fetchError
                            ? "There was an error loading this organisation. Please try again later."
                            : `The organisation "${tenantCode}" could not be found.`
                        }
                    </p>
                    <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Return to Dashboard
                    </a>
                </div>
            </div>
        );
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
        redirect(`/communityos/access-denied?tenant=${tenantCode}`);
    }

    const sanitizedLogoUrl = safeUrl(tenant.logoUrl);

    return (
        <TenantProviders tenant={tenant} userRole={role as TenantRole}>
            <div className="flex min-h-screen flex-col">
                {/* Tenant Header */}
                <header
                    className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 transition-colors"
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                {sanitizedLogoUrl && (
                                    <img
                                        src={sanitizedLogoUrl}
                                        alt="" // Decorative if name follows
                                        className="h-8 w-8 rounded object-cover"
                                        aria-hidden="true"
                                    />
                                )}
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {tenant.name}
                                </span>
                            </div>

                            {/* Simple Breadcrumb */}
                            <nav aria-label="Breadcrumb" className="hidden border-l border-gray-200 pl-4 sm:block dark:border-gray-700">
                                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                                    <li>
                                        <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
                                    </li>
                                    <li aria-hidden="true">/</li>
                                    <li className="font-medium text-gray-900 dark:text-white truncate max-w-[100px] md:max-w-xs">
                                        {tenant.name}
                                    </li>
                                </ol>
                            </nav>
                        </div>

                        <nav className="flex items-center gap-6">
                            <Link
                                href={`/communityos/${tenantCode}/dashboard`}
                                className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            >
                                Home
                            </Link>
                            {(role === 'admin' || role === 'board') && (
                                <Link
                                    href={`/communityos/${tenantCode}/settings/profile`}
                                    className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                >
                                    Settings
                                </Link>
                            )}
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            >
                                Switch Organisation
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
                    {children}
                </main>

                {/* Tenant Footer */}
                <footer className="border-t bg-gray-50 py-8 dark:bg-gray-800/50 mt-12">
                    <div className="mx-auto max-w-7xl px-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Powered by{" "}
                            <a
                                href="https://smalltalk.community"
                                className="font-semibold text-primary hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                CommunityOS
                            </a>
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            &copy; {new Date().getFullYear()} smalltalk.community Inc. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </TenantProviders>
    );
}

export async function generateMetadata({ params }: TenantLayoutProps) {
    const { tenantId: tenantCode } = await params;
    const tenant = await getTenantByCode(tenantCode);

    if (!tenant) {
        return { title: "Organisation Not Found" };
    }

    return {
        title: {
            template: `%s | ${tenant.name}`,
            default: tenant.name,
        },
        description: tenant.description ?? `${tenant.name} - Powered by CommunityOS`,
    };
}
