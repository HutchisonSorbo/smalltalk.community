"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTenant } from "../TenantProvider";
import { useDittoSync } from "@/hooks/useDittoSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIDashboard } from "./impact/kpi-dashboard";
import { KPIBuilder } from "./impact/kpi-builder";
import { ReportBuilder } from "./impact/report-builder";
import { InsightsPanel } from "./impact/insights-panel";
import { ImpactBarChart, ImpactPieChart, ImpactLineChart } from "./impact/charts";
import { ImpactKPI, ImpactReport } from "@/lib/communityos/impact/types";
import { BarChart3, FileText, LayoutDashboard, Plus, Loader2 } from "lucide-react";
import { COSButton as Button } from "../ui/cos-button";
import { MOCK_KPIS, MOCK_CHART_DATA, MOCK_DISTRIBUTION_DATA } from "@/lib/communityos/impact/mocks";
import { toast } from "sonner";

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

function ChartsGrid({ kpis }: { kpis: ImpactKPI[] }) {
    // In a real app, these would be derived from kpis or a separate chart_data collection
    return (
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
    );
}

export function ImpactApp() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const [view, setView] = useState<'dashboard' | 'reports' | 'builder'>('dashboard');

    // Data Sync - KPIs
    const {
        documents: items,
        upsertDocument: upsertKPI,
        deleteDocument: deleteKPI,
        isLoading: isKPILoading
    } = useDittoSync<ImpactKPI>({
        collection: "impact_kpis",
        tenantId: tenant?.id || ""
    });

    // Data Sync - Reports
    const {
        documents: reports,
        upsertDocument: upsertReport,
        isLoading: isReportsLoading
    } = useDittoSync<ImpactReport>({
        collection: "impact_reports",
        tenantId: tenant?.id || ""
    });

    // Merge mock data with real data for demonstration if empty
    const displayKPIs = useMemo(() => {
        if (isKPILoading) return [];
        return items.length > 0 ? items : MOCK_KPIS;
    }, [items, isKPILoading]);

    const handleKPIClick = (kpi: ImpactKPI) => {
        toast.info(`${kpi.name}: ${kpi.value} ${kpi.unit}`, {
            description: kpi.description
        });
    };

    const handleSaveKPI = async (newKPIData: Partial<ImpactKPI>) => {
        try {
            const id = crypto.randomUUID();
            const newKPI: ImpactKPI = {
                ...newKPIData,
                id,
                value: 0, // Initial value
                trend: 'stable'
            } as ImpactKPI;
            await upsertKPI(id, newKPI);
            setView('dashboard');
            toast.success("KPI Created");
        } catch (err) {
            console.error("[ImpactApp] Error creating KPI:", err);
            toast.error("Failed to create KPI. Please try again.");
        }
    };

    const handleSaveReport = async (sections: any[]) => {
        try {
            const id = crypto.randomUUID();
            const newReport: ImpactReport = {
                id,
                title: `Report ${new Date().toLocaleDateString()}`,
                period: { start: new Date().toISOString(), end: new Date().toISOString() },
                sections,
                status: 'draft',
                createdAt: new Date().toISOString(),
                createdBy: 'user'
            };
            await upsertReport(id, newReport);
            toast.success("Report Saved");
        } catch (err) {
            console.error("[ImpactApp] Error saving report:", err);
            toast.error("Failed to save report. Please try again.");
        }
    };

    if (isTenantLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tenant) return <div className="p-8 text-center text-destructive">Organisation context missing.</div>;

    if (view === 'builder') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setView('dashboard')}>
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-2xl font-bold">KPI Builder</h1>
                </div>
                <KPIBuilder onCancel={() => setView('dashboard')} onSave={handleSaveKPI} />
            </div>
        );
    }

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
                    <InsightsPanel kpis={displayKPIs} />

                    <KPIDashboard
                        kpis={displayKPIs}
                        isLoading={isKPILoading}
                        onKPIClick={handleKPIClick}
                    />

                    <ChartsGrid kpis={displayKPIs} />

                    <div className="flex justify-start pt-4">
                        <Button
                            variant="ghost"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={() => setView('builder')}
                        >
                            Add Custom KPI
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6 mt-6">
                    <ReportBuilder
                        initialSections={reports.length > 0 ? reports[0].sections : [
                            { id: '1', type: 'header', content: `Impact Report - ${new Date().toLocaleString('en-AU', { month: 'long', year: 'numeric' })}`, order: 0 },
                            { id: '2', type: 'text', content: 'Executive summary goes here...', order: 1 },
                            { id: '3', type: 'kpi-grid', content: displayKPIs.slice(0, 3).map(k => k.id), order: 2 },
                        ]}
                        onSave={handleSaveReport}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}