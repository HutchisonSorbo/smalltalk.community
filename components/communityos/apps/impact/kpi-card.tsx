"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactKPI } from "@/lib/communityos/impact/types";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
    kpi: ImpactKPI;
    onClick?: () => void;
    className?: string;
}

export function KPICard({ kpi, onClick, className }: KPICardProps) {
    const isPositive = kpi.trend === 'up';
    const isNegative = kpi.trend === 'down';
    const isStable = kpi.trend === 'stable';

    let trendColor = "text-muted-foreground";
    let TrendIcon = Minus;

    if (isPositive) {
        trendColor = "text-green-600 dark:text-green-400";
        TrendIcon = TrendingUp;
    } else if (isNegative) {
        trendColor = "text-red-600 dark:text-red-400";
        TrendIcon = TrendingDown;
    }

    // Calculate goal percentage if goal exists
    const goalPercentage = kpi.goal ? Math.round((kpi.value / kpi.goal) * 100) : null;

    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-md ${className}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            aria-label={`View details for ${kpi.name}`}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.name}
                </CardTitle>
                <TrendIcon className={`h-4 w-4 ${trendColor}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {kpi.value.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                </div>

                <div className="flex items-center mt-1 space-x-2">
                    {kpi.trendPercentage != null && (
                        <span className={`text-xs font-medium flex items-center ${trendColor}`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : isNegative ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                            {kpi.trendPercentage}%
                        </span>
                    )}

                    {goalPercentage !== null && (
                        <span className="text-xs text-muted-foreground">
                            {goalPercentage}% of goal
                        </span>
                    )}
                </div>

                {goalPercentage !== null && (
                    <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden" role="progressbar" aria-label="Goal Progress" aria-valuenow={goalPercentage} aria-valuemin={0} aria-valuemax={100}>
                        <div
                            className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(goalPercentage, 100)}%` }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
