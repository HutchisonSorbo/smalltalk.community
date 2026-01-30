"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { COSCard } from "./cos-card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface COSStatsCardProps {
    label: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    icon?: React.ReactNode;
    variant?: 'default' | 'glass';
    className?: string;
}

const COSStatsCard = ({ label, value, description, trend, icon, variant = 'default', className }: COSStatsCardProps) => {
    return (
        <COSCard
            variant={variant}
            className={cn("p-6 overflow-hidden relative group", className)}
        >
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <h2 className="text-3xl font-black tracking-tight">
                        {value}
                    </h2>
                </div>

                {icon && (
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        {icon}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-3">
                {trend ? (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                        trend.isUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend.value}%
                    </div>
                ) : (
                    <div className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        No change
                    </div>
                )}

                {description && (
                    <span className="text-xs text-muted-foreground font-medium truncate">
                        {description}
                    </span>
                )}
            </div>
        </COSCard>
    );
};

export { COSStatsCard };
