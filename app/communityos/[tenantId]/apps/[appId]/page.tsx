/**
 * CommunityOS App Page
 * Dynamic page that loads the appropriate app component based on appId
 */

import { notFound } from "next/navigation";
import { AppShell } from "@/components/communityos/AppShell";
import { AppContentLoader } from "@/components/communityos/AppContentLoader";
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
            <AppContentLoader appId={appId} />
        </AppShell>
    );
}

