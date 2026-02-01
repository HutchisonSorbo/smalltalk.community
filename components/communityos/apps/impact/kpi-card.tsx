"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactKPI } from "@/lib/communityos/impact/types";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface KPICardProps {
    kpi: ImpactKPI;
    onClick?: () => void;
    className?: string;
}

function KPICardHeader({ title, TrendIcon, trendColor }: { title: string; TrendIcon: LucideIcon; trendColor: string }) {
    return (
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                {title}
            </CardTitle>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} aria-hidden="true" />
        </CardHeader>
    );
}

function KPICardTrend({
    trendPercentage,
    isPositive,
    isNegative,
    trendColor,
    goalPercentage
}: {
    trendPercentage?: number | null;
    isPositive: boolean;
    isNegative: boolean;
    trendColor: string;
    goalPercentage: number | null;
}) {
    return (
        <div className="flex items-center mt-1 space-x-2">
            {trendPercentage != null && (
                <span className={`text-xs font-medium flex items-center ${trendColor}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : isNegative ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                    {trendPercentage}%
                </span>
            )}

            {goalPercentage !== null && (
                <span className="text-xs text-muted-foreground">
                    {goalPercentage}% of goal
                </span>
            )}
        </div>
    );
}

function KPICardGoalProgress({ percentage, isPositive }: { percentage: number; isPositive: boolean }) {
    const clampedValue = Math.min(Math.max(percentage, 0), 100);

    return (
        <div
            className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Goal Progress"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${clampedValue}%` }}
            />
        </div>
    );
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
            <KPICardHeader title={kpi.name} TrendIcon={TrendIcon} trendColor={trendColor} />
            <CardContent>
                <div className="text-2xl font-bold">
                    {kpi.value.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                </div>

                <KPICardTrend
                    trendPercentage={kpi.trendPercentage}
                    isPositive={isPositive}
                    isNegative={isNegative}
                    trendColor={trendColor}
                    goalPercentage={goalPercentage}
                />

                {goalPercentage !== null && (
                    <KPICardGoalProgress percentage={goalPercentage} isPositive={isPositive} />
                )}
            </CardContent>
        </Card>
    );
}
