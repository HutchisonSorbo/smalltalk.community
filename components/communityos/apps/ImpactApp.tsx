"use client";

import React, { useState } from "react";
import { useTenant } from "../TenantProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIDashboard } from "./impact/kpi-dashboard";
import { KPIBuilder } from "./impact/kpi-builder";
import { ReportBuilder } from "./impact/report-builder";
import { InsightsPanel } from "./impact/insights-panel";
import { ImpactBarChart, ImpactPieChart, ImpactLineChart } from "./impact/charts";
import { ImpactKPI } from "@/lib/communityos/impact/types";
import { BarChart3, FileText, LayoutDashboard, Plus } from "lucide-react";
import { COSButton as Button } from "../ui/cos-button"; // Fixed import

// Mock Data for Demonstration
const MOCK_KPIS: ImpactKPI[] = [
    { id: '1', name: 'Lives Impacted', value: 1250, unit: 'people', trend: 'up', trendPercentage: 12, category: 'Community', dataSource: 'crm', goal: 1500 },
    { id: '2', name: 'Volunteer Hours', value: 450, unit: 'hours', trend: 'stable', category: 'Engagement', dataSource: 'volunteers', goal: 500 },
    { id: '3', name: 'Donations Raised', value: 15000, unit: 'AUD', trend: 'up', trendPercentage: 8, category: 'Financial', dataSource: 'donations', goal: 20000 },
    { id: '4', name: 'New Members', value: 45, unit: 'members', trend: 'down', trendPercentage: 5, category: 'Growth', dataSource: 'crm', goal: 60 }
];

const MOCK_CHART_DATA = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 700 },
];

const MOCK_DISTRIBUTION_DATA = [
    { name: 'Education', value: 400 },
    { name: 'Health', value: 300 },
    { name: 'Environment', value: 300 },
];

function ImpactHeader({ name }: { name: string }) {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Impact Reporting</h1>
                <p className="text-muted-foreground">
                    Track, measure, and report on the social impact of {name}.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" icon={<Plus className="h-4 w-4" />}>
                    Connect Data Source
                </Button>
            </div>
        </div>
    );
}

function LoadingState() {
    return <div className="p-8 text-center text-muted-foreground">Loading impact data...</div>;
}

function ErrorState() {
    return <div className="p-8 text-center text-destructive">Failed to load tenant information.</div>;
}

export function ImpactApp() {
    const { tenant, isLoading } = useTenant();
    const [kpis, setKpis] = useState<ImpactKPI[]>(MOCK_KPIS);
    const [view, setView] = useState<'dashboard' | 'reports' | 'builder'>('dashboard');

    if (isLoading) return <LoadingState />;
    if (!tenant) return <ErrorState />;

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden pb-12">
            <ImpactHeader name={tenant.name} />

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-6">
                    {/* Insights Panel */}
                    <InsightsPanel kpis={kpis} />

                    {/* KPI Cards */}
                    <KPIDashboard
                        kpis={kpis}
                        isLoading={false}
                        onKPIClick={(kpi) => console.log('Clicked KPI:', kpi.name)}
                    />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <ImpactBarChart
                            title="Monthly Impact"
                            description="Impact metric growth over time"
                            data={MOCK_CHART_DATA}
                            xKey="name"
                            bars={[{ key: 'value', name: 'Impact Value' }]}
                        />
                        <ImpactPieChart
                            title="Impact Distribution"
                            description="Distribution by category"
                            data={MOCK_DISTRIBUTION_DATA}
                            nameKey="name"
                            valueKey="value"
                        />
                        <ImpactLineChart
                            title="Trend Analysis"
                            description="6-month trend projection"
                            data={MOCK_CHART_DATA}
                            xKey="name"
                            lines={[{ key: 'value', name: 'Projected Value', color: '#8884d8' }]}
                        />
                    </div>

                    <div className="flex justify-start pt-4">
                        <Button variant="ghost" icon={<Plus className="h-4 w-4" onClick={() => setView('builder')} />}>
                            Add Custom KPI
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6 mt-6">
                    <ReportBuilder
                        initialSections={[
                            { id: '1', type: 'header', content: 'Monthly Impact Report - May 2026', order: 0 },
                            { id: '2', type: 'text', content: 'This month we saw significant growth in volunteer participation...', order: 1 },
                            { id: '3', type: 'kpi-grid', content: 'Standard KPIs', order: 2 },
                        ]}
                        onSave={(sections) => console.log('Saved report:', sections)}
                    />
                </TabsContent>
            </Tabs>

            {/* Conditional Rendering for KPI Builder Modal (if view state was full page, or use Dialog) */}
            {/* For now, just a button placeholder in dashboard */}
        </div>
    );
}