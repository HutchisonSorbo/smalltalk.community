"use client";

/**
 * AppContentLoader Component
 * Dynamically loads CommunityOS app components with proper Suspense boundaries
 * to avoid Server Component hydration errors
 */

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { communityOSApps } from "./AppLauncher";

// Loading skeleton for apps
function AppLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-32 rounded-lg border bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                    />
                ))}
            </div>
        </div>
    );
}

// Dynamic imports for apps - loaded client-side with code splitting
const CRMApp = dynamic(
    () => import("./apps/CRMApp").then((m) => ({ default: m.CRMApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const RosteringApp = dynamic(
    () => import("./apps/RosteringApp").then((m) => ({ default: m.RosteringApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const InventoryApp = dynamic(
    () => import("./apps/InventoryApp").then((m) => ({ default: m.InventoryApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const GenericCommunityApp = dynamic(
    () => import("./apps/GenericCommunityApp").then((m) => ({ default: m.GenericCommunityApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

interface AppContentLoaderProps {
    appId: string;
}

export function AppContentLoader({ appId }: AppContentLoaderProps) {
    const renderApp = () => {
        switch (appId) {
            case "crm":
                return <CRMApp />;
            case "rostering":
                return <RosteringApp />;
            case "assets":
            case "inventory":
                return <InventoryApp />;
            default: {
                // Use GenericCommunityApp for all other apps
                const app = communityOSApps.find((a) => a.id === appId);
                if (!app) return null;
                return (
                    <GenericCommunityApp
                        appId={appId}
                        title={app.name}
                        description={app.description}
                        placeholder={`No ${app.name.toLowerCase()} items found yet.`}
                        itemType={app.name.endsWith("s") ? app.name.slice(0, -1) : "Record"}
                    />
                );
            }
        }
    };

    return (
        <Suspense fallback={<AppLoadingSkeleton />}>
            {renderApp()}
        </Suspense>
    );
}
