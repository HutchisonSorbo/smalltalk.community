/**
 * CommunityOS App Page
 * Dynamic page that loads the appropriate app component based on appId
 */

import { notFound } from "next/navigation";
import { AppShell } from "@/components/communityos/AppShell";
import { communityOSApps } from "@/components/communityos/AppLauncher";

interface AppPageProps {
    params: Promise<{ tenantId: string; appId: string }>;
}

export async function generateMetadata({ params }: AppPageProps) {
    const { appId } = await params;
    const app = communityOSApps.find((a) => a.id === appId);

    if (!app) {
        return { title: "App Not Found" };
    }

    return {
        title: app.name,
        description: app.description,
    };
}

export default async function AppPage({ params }: AppPageProps) {
    const { tenantId, appId } = await params;

    // Validate app exists
    const app = communityOSApps.find((a) => a.id === appId);
    if (!app) {
        notFound();
    }

    return (
        <AppShell appId={appId} tenantCode={tenantId}>
            {/* Placeholder content - will be replaced with Ditto-enabled React components */}
            <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-6xl" role="img" aria-label={app.name}>
                        {app.icon}
                    </span>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {app.name}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {app.description}
                    </p>
                    <div className="mt-6 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                            🚧 Coming Soon
                        </h3>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                            This app is being converted to a fully offline-capable React
                            component with Ditto sync. Stay tuned!
                        </p>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Offline-Ready
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Real-time Sync
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Multi-Device
                        </span>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
