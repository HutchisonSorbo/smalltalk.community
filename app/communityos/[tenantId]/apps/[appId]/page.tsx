/**
 * CommunityOS App Page
 * Dynamic page that loads the appropriate app component based on appId
 */

import { notFound } from "next/navigation";
import { AppShell } from "@/components/communityos/AppShell";
import { communityOSApps } from "@/components/communityos/AppLauncher";
import { CRMApp } from "@/components/communityos/apps/CRMApp";
import { RosteringApp } from "@/components/communityos/apps/RosteringApp";
import { InventoryApp } from "@/components/communityos/apps/InventoryApp";
import { GenericCommunityApp } from "@/components/communityos/apps/GenericCommunityApp";

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

    const renderApp = (appId: string) => {
        switch (appId) {
            case "crm":
                return <CRMApp />;
            case "rostering":
                return <RosteringApp />;
            case "inventory":
                return <InventoryApp />;
            default: {
                const app = communityOSApps.find((a) => a.id === appId);
                if (!app) return null;
                return (
                    <GenericCommunityApp
                        appId={appId}
                        title={app.name}
                        description={app.description}
                        placeholder={`No ${app.name.toLowerCase()} items found yet.`}
                        itemType={app.name.endsWith('s') ? app.name.slice(0, -1) : "Record"}
                    />
                );
            }
        }
    };

    return (
        <AppShell appId={appId} tenantCode={tenantId}>
            {renderApp(appId)}
        </AppShell>
    );
}
