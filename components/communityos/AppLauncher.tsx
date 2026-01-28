/**
 * CommunityOS App Launcher Component
 * Displays a grid of apps available to the tenant
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTenant } from "./TenantProvider";
import { communityOSApps, type CommunityOSApp } from "./apps-config";

const categoryLabels: Record<string, string> = {
    operations: "Operations",
    programs: "Programs & Events",
    governance: "Governance & Compliance",
    finance: "Finance & Fundraising",
    admin: "Administration",
};

interface AppLauncherProps {
    tenantCode: string;
    searchable?: boolean;
    grouped?: boolean;
}

export function AppLauncher({ tenantCode, searchable = true, grouped = true }: AppLauncherProps) {
    const { userRole, isBoardOrAbove } = useTenant();
    const [search, setSearch] = useState("");

    // Filter apps based on user role and search
    const filteredApps = useMemo(() => {
        return communityOSApps.filter((app) => {
            // Role-based filtering
            if (app.requiredRole === "admin" && userRole !== "admin") return false;
            if (app.requiredRole === "board" && !isBoardOrAbove) return false;

            // Search filtering
            if (search) {
                const searchLower = search.toLowerCase();
                return (
                    app.name.toLowerCase().includes(searchLower) ||
                    app.description.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });
    }, [search, userRole, isBoardOrAbove]);

    // Group apps by category if grouped is true
    const groupedApps = useMemo(() => {
        if (!grouped) return { all: filteredApps };

        return filteredApps.reduce((acc, app) => {
            if (!acc[app.category]) acc[app.category] = [];
            acc[app.category].push(app);
            return acc;
        }, {} as Record<string, CommunityOSApp[]>);
    }, [filteredApps, grouped]);

    return (
        <div className="space-y-6">
            {/* Search */}
            {searchable && (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
            )}

            {/* App Grid */}
            {Object.entries(groupedApps).map(([category, apps]) => (
                <section key={category}>
                    {grouped && category !== "all" && (
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {categoryLabels[category] || category}
                        </h3>
                    )}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {apps.map((app) => (
                            <Link
                                key={app.id}
                                href={`/communityos/${tenantCode}/apps/${app.id}`}
                                className="group flex flex-col items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--tenant-primary,#4F46E5)] dark:border-gray-700 dark:bg-gray-800"
                            >
                                <span className="text-3xl" role="img" aria-label={app.name}>
                                    {app.icon}
                                </span>
                                <span className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                    {app.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}

            {filteredApps.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    <p>No apps found matching "{search}"</p>
                </div>
            )}
        </div>
    );
}
