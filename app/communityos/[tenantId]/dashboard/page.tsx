/**
 * CommunityOS Dashboard Page
 * Main entry point for tenant users - displays app launcher, information hub, and AI insights
 */

import type { Metadata } from "next";
import { getTenantByCode } from "@/lib/communityos/tenant-context";
import { AppLauncher } from "@/components/communityos/AppLauncher";
import { InformationHub } from "@/components/communityos/information-hub";
import { CommunityInsightsAI } from "@/components/communityos/CommunityInsightsAI";

interface DashboardPageProps {
    params: Promise<{ tenantId: string }>;
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
    const { tenantId } = await params;
    const tenant = await getTenantByCode(tenantId);
    return {
        title: `Dashboard | ${tenant?.name ?? "CommunityOS"}`,
    };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { tenantId } = await params;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <section>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Access your organisation&apos;s tools, governance, and community insights
                </p>
            </section>

            {/* App Launcher Grid */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Apps
                </h2>
                <AppLauncher tenantCode={tenantId} searchable={false} grouped={false} />
            </section>

            {/* Community Insights AI */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Community Insights AI
                </h2>
                <CommunityInsightsAI />
            </section>

            {/* Information Hub */}
            <section>
                <InformationHub tenantCode={tenantId} />
            </section>
        </div>
    );
}

