"use client";

/**
 * AppContentLoader Component
 * Dynamically loads CommunityOS app components with proper client-side boundaries
 * to avoid Server Component hydration errors
 */

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { communityOSApps } from "./apps-config";

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

// Error Fallback Component with enhanced logging
function AppErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
    const router = useRouter();
    // Use a stable error code for the lifetime of this component instance
    const errorCodeRef = useRef(`ERR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    const errorCode = errorCodeRef.current;

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log the error (securely in production with Sentry) via useEffect
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (process.env.NODE_ENV === "development") {
                console.error("[AppContentLoader] Error:", error);
                console.error("[AppContentLoader] Stack:", errorStack);
            } else {
                // Log to Sentry in production
                const logToSentry = async () => {
                    try {
                        const Sentry = await import("@sentry/nextjs");
                        Sentry.captureException(error, {
                            tags: {
                                component: "AppContentLoader",
                                errorCode,
                            },
                            extra: {
                                errorMessage,
                            },
                        });
                    } catch (err) {
                        // Silent fallback - avoid leaking internals to console
                    }
                };
                logToSentry();
            }
        }
    }, [error, errorMessage, errorStack, errorCode]);

    return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
            <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
                Failed to load application
            </h3>
            <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-300">
                An unexpected error occurred. Please try refreshing the page.
                If this problem persists, contact support with error code: <code className="font-mono text-xs">{errorCode}</code>
            </p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={resetErrorBoundary}
                    className="rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                >
                    Try again
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-all dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

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

const ImpactApp = dynamic(
    () => import("./apps/ImpactApp").then((m) => ({ default: m.ImpactApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const SafeguardingCentre = dynamic(
    () => import("./apps/SafeguardingCentre").then((m) => ({ default: m.SafeguardingCentre })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const WorkflowApp = dynamic(
    () => import("./apps/WorkflowApp").then((m) => ({ default: m.WorkflowApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

const GenericCommunityApp = dynamic(
    () => import("./apps/GenericCommunityApp").then((m) => ({ default: m.GenericCommunityApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);

interface AppContentLoaderProps {
    appId: string;
}

/**
 * Derives item type from app name for multi-word names
 * Prefers explicit itemType if set, otherwise extracts last word and removes trailing 's'
 */
function deriveItemType(appName: string, explicitItemType?: string): string {
    if (explicitItemType) return explicitItemType;

    // Split on whitespace and get last word
    const words = appName.trim().split(/\s+/);
    const lastWord = words[words.length - 1] || "Record";

    // Remove trailing punctuation and trim
    const cleaned = lastWord.replace(/[^\w]/g, "");

    // Simple plural removal (trailing 's')
    if (cleaned.endsWith("s") && cleaned.length > 1) {
        return cleaned.slice(0, -1);
    }

    return cleaned || "Record";
}

/**
 * AppContentLoader component dynamically renders the appropriate CommunityOS app
 * based on the provided appId. Uses dynamic imports with code splitting to load
 * specialized app components (CRM, Rostering, Inventory) or falls back to
 * GenericCommunityApp for other registered apps.
 *
 * @param props - The component props conforming to {@link AppContentLoaderProps}
                    * @param props.appId - The unique identifier of the app to render (e.g., "crm", "rostering", "assets")
                    * @returns A React.ReactElement containing the rendered app component, or null if the appId is not found
                    */
export function AppContentLoader({ appId }: AppContentLoaderProps): React.ReactElement | null {
    const renderContent = () => {
        switch (appId) {
            case "crm":
                return <CRMApp />;
            case "rostering":
                return <RosteringApp />;
            case "assets":
            case "inventory":
                return <InventoryApp />;
            case "impact":
                return <ImpactApp />;
            case "safeguarding":
                return <SafeguardingCentre />;
            case "workflow":
                return <WorkflowApp />;
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
                        itemType={deriveItemType(app.name, app.itemType)}
                    />
                );
            }
        }
    };

    return (
        <ErrorBoundary FallbackComponent={AppErrorFallback}>
            {renderContent()}
        </ErrorBoundary>
    );
}

