"use client";

import React from "react";
import { ImpactKPI } from "@/lib/communityos/impact/types";
import { KPICard } from "./kpi-card";
import { AlertCircle } from "lucide-react";

interface KPIDashboardProps {
    kpis: ImpactKPI[];
    onKPIClick?: (kpi: ImpactKPI) => void;
    isLoading?: boolean;
}

function LoadingPlaceholder() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-gray-50 border-dashed dark:bg-gray-900/50 dark:border-gray-800">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No KPIs Configured</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Get started by adding Key Performance Indicators to track your community impact.
            </p>
        </div>
    );
}

function CategorySection({
    category,
    kpis,
    onKPIClick
}: {
    category?: string;
    kpis: ImpactKPI[];
    onKPIClick?: (kpi: ImpactKPI) => void
}) {
    return (
        <div className="space-y-3">
            {category && <h3 className="text-lg font-semibold tracking-tight truncate">{category}</h3>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <KPICard
                        key={kpi.id}
                        kpi={kpi}
                        onClick={() => onKPIClick?.(kpi)}
                    />
                ))}
            </div>
        </div>
    );
}

export function KPIDashboard({ kpis, onKPIClick, isLoading }: KPIDashboardProps) {
    if (isLoading) return <LoadingPlaceholder />;
    if (kpis.length === 0) return <EmptyState />;

    const categories = Array.from(new Set(kpis.map(k => k.category)));
    const hasMultipleCategories = categories.length > 1;

    if (!hasMultipleCategories) {
        return <CategorySection kpis={kpis} onKPIClick={onKPIClick} />;
    }

    return (
        <div className="space-y-8">
            {categories.map(category => {
                const categoryKpis = kpis.filter(k => k.category === category);
                if (categoryKpis.length === 0) return null;

                return (
                    <CategorySection
                        key={category}
                        category={category}
                        kpis={categoryKpis}
                        onKPIClick={onKPIClick}
                    />
                );
            })}
        </div>
    );
}
