/**
 * CommunityOS Dashboard Page
 * Main entry point for tenant users - displays app launcher and quick stats
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { getTenantByCode } from "@/lib/communityos/tenant-context";

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

// CommunityOS App definitions
const communityOSApps = [
    { id: "crm", name: "CRM", icon: "👥", description: "Manage contacts and members" },
    { id: "rostering", name: "Rostering", icon: "📅", description: "Schedule staff and volunteers" },
    { id: "events", name: "Events & Programs", icon: "🎉", description: "Manage events and programs" },
    { id: "financial", name: "Financial Management", icon: "💰", description: "Track finances and budgets" },
    { id: "governance", name: "Governance Compliance", icon: "⚖️", description: "Compliance and governance tools" },
    { id: "safeguarding", name: "Safeguarding Centre", icon: "🛡️", description: "Child safety and safeguarding" },
    { id: "assets", name: "Assets Inventory", icon: "📦", description: "Track organisational assets" },
    { id: "committee", name: "Committee Management", icon: "👔", description: "Manage board and committees" },
    { id: "communications", name: "Communications Hub", icon: "📢", description: "Internal communications" },
    { id: "fundraising", name: "Fundraising", icon: "🎁", description: "Fundraising and development" },
    { id: "impact", name: "Impact Reporting", icon: "📊", description: "Track and report outcomes" },
    { id: "learning", name: "Learning & Development", icon: "🎓", description: "Training and development" },
    { id: "lessons", name: "Lessons & Workshops", icon: "📚", description: "Educational programs" },
    { id: "meetings", name: "Meetings & Reporting", icon: "📝", description: "Meeting management" },
    { id: "partnerships", name: "Partnerships & MOUs", icon: "🤝", description: "Partnership management" },
    { id: "policy", name: "Policy Library", icon: "📋", description: "Policies and procedures" },
    { id: "projects", name: "Project Management", icon: "🏗️", description: "Manage projects" },
    { id: "records", name: "Records & Privacy", icon: "🔒", description: "Records management" },
    { id: "risk", name: "Risk & Compliance", icon: "⚠️", description: "Risk management" },
    { id: "dashboard-org", name: "Organisation Dashboard", icon: "🏢", description: "Overview and analytics" },
];

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
                    Access your organisation's tools and apps
                </p>
            </section>

            {/* App Launcher Grid */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Apps
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {communityOSApps.map((app) => (
                        <a
                            key={app.id}
                            href={`/communityos/${tenantId}/apps/${app.id}`}
                            className="group flex flex-col items-center rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            style={{
                                "--tw-border-opacity": "1",
                            } as React.CSSProperties}
                        >
                            <span className="text-3xl" role="img" aria-label={app.name}>
                                {app.icon}
                            </span>
                            <span className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                {app.name}
                            </span>
                            <span className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                                {app.description}
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Community Insights AI (Coming Soon) */}
            <section className="rounded-lg border bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            Community Insights AI
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ask questions about your community demographics and local amenities.
                            Coming soon.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
