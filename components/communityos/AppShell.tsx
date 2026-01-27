/**
 * CommunityOS App Shell Component
 * Provides consistent layout wrapper for individual CommunityOS apps
 */

"use client";

import Link from "next/link";
import { useTenant } from "./TenantProvider";
import { communityOSApps } from "./apps-config";

interface AppShellProps {
    appId: string;
    tenantCode: string;
    children: React.ReactNode;
}

export function AppShell({ appId, tenantCode, children }: AppShellProps) {
    const { tenant } = useTenant();
    const app = communityOSApps.find((a) => a.id === appId);

    if (!app) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        App Not Found
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        The requested app does not exist.
                    </p>
                    <Link
                        href={`/communityos/${tenantCode}/dashboard`}
                        className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* App Header */}
            <header className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/communityos/${tenantCode}/dashboard`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Back to Dashboard"
                    >
                        ←
                    </Link>
                    <span className="text-2xl" role="img" aria-label={app.name}>
                        {app.icon}
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {app.name}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {app.description}
                        </p>
                    </div>
                </div>

                {/* App Actions placeholder */}
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Online
                    </span>
                </div>
            </header>

            {/* App Content */}
            <main className="min-h-[60vh]">{children}</main>

            {/* App Footer - Print optimized */}
            <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-500 print:block dark:border-gray-700 hidden">
                <p>
                    {tenant?.name} • {app.name} • Powered by CommunityOS
                </p>
                <p className="print:block hidden">
                    Printed on {new Date().toLocaleDateString("en-AU")}
                </p>
            </footer>
        </div>
    );
}
