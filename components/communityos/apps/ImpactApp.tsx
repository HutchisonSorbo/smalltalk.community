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

import { MOCK_KPIS, MOCK_CHART_DATA, MOCK_DISTRIBUTION_DATA } from "@/lib/communityos/impact/mocks";
import { toast } from "@/hooks/use-toast"; // Assuming toast hook exists based on project style

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
    return <div className="p-8 text-center text-muted-foreground" role="status" aria-live="polite">Loading impact data...</div>;
}

function ErrorState() {
    return <div className="p-8 text-center text-destructive" role="alert" aria-live="assertive">Failed to load tenant information.</div>;
}

function ImpactBuilderView({
    onBack,
    onSave
}: {
    onBack: () => void;
    onSave: React.ComponentProps<typeof KPIBuilder>['onSave']
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack}>
                    ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">KPI Builder</h1>
            </div>
            <KPIBuilder
                onCancel={onBack}
                onSave={onSave}
            />
        </div>
    );
}

function ImpactDashboardView({
    tenantName,
    kpis,
    onKPIClick,
    onAddKPI
}: {
    tenantName: string;
    kpis: ImpactKPI[];
    onKPIClick: (kpi: ImpactKPI) => void;
    onAddKPI: () => void;
}) {
    return (
        <div className="space-y-6 max-w-full overflow-x-hidden pb-12">
            <ImpactHeader name={tenantName} />

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
                    <InsightsPanel kpis={kpis} />
                    <KPIDashboard
                        kpis={kpis}
                        isLoading={false}
                        onKPIClick={onKPIClick}
                    />

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
                        <Button
                            variant="ghost"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={onAddKPI}
                        >
                            Add Custom KPI
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6 mt-6">
                    <ReportBuilder
                        initialSections={[
                            { id: '1', type: 'header', content: 'Monthly Impact Report - May 2026', order: 0, title: '' },
                            { id: '2', type: 'text', content: 'This month we saw significant growth in volunteer participation...', order: 1, title: '' },
                            { id: '3', type: 'kpi-grid', content: ['1', '2', '3'], order: 2, title: '' },
                        ]}
                        onSave={(sections) => console.log('Saved report:', sections)}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function ImpactApp() {
    const { tenant, isLoading } = useTenant();
    const [kpis, setKpis] = useState<ImpactKPI[]>(MOCK_KPIS);
    const [view, setView] = useState<'dashboard' | 'reports' | 'builder'>('dashboard');

    if (isLoading) return <LoadingState />;
    if (!tenant) return <ErrorState />;

    const handleKPIClick = (kpi: ImpactKPI) => {
        toast({
            title: kpi.name,
            description: `Showing details for ${kpi.name}. ${kpi.trendPercentage ? `${kpi.trendPercentage}% trend` : 'Stable performance'}.`
        });
    };

    const handleSaveKPI = (newKPIData: Parameters<React.ComponentProps<typeof KPIBuilder>['onSave']>[0]) => {
        const newKPI: ImpactKPI = {
            ...newKPIData,
            id: crypto.randomUUID(),
            value: 0,
            trend: 'stable'
        };
        setKpis([...kpis, newKPI]);
        setView('dashboard');
        toast({ title: "KPI Created", description: `${newKPI.name} has been added to your dashboard.` });
    };

    if (view === 'builder') {
        return <ImpactBuilderView onBack={() => setView('dashboard')} onSave={handleSaveKPI} />;
    }

    return (
        <ImpactDashboardView
            tenantName={tenant.name}
            kpis={kpis}
            onKPIClick={handleKPIClick}
            onAddKPI={() => setView('builder')}
        />
    );
}