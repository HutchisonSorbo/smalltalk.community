"use client";

import React from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Progress } from "@/components/ui/progress";
import { VCSSStandard } from "@/lib/communityos/safeguarding/types";
import { Shield, CheckCircle2, AlertCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceDashboardProps {
    standards: VCSSStandard[];
    incidentsCount: number;
    expiringCredentialsCount: number;
    onSelectStandard: (id: number) => void;
}

export function ComplianceDashboard({
    standards,
    incidentsCount,
    expiringCredentialsCount,
    onSelectStandard,
}: ComplianceDashboardProps) {
    const { completedCount, overallProgress } = React.useMemo(() => {
        if (standards.length === 0) return { completedCount: 0, overallProgress: 0 };
        const count = standards.filter((s) => s.status === "compliant").length;
        return {
            completedCount: count,
            overallProgress: Math.round((count / standards.length) * 100),
        };
    }, [standards]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-full">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <COSCard variant="glass" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Overall Compliance</span>
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl font-bold">{overallProgress}%</div>
                        <Progress value={overallProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            {completedCount} of {standards.length} standards compliant
                        </p>
                    </div>
                </COSCard>

                <COSCard variant="glass" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Active Incidents</span>
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold">{incidentsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </div>
                </COSCard>

                <COSCard variant="glass" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Credential Alerts</span>
                        <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold">{expiringCredentialsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Expiring within 30 days
                        </p>
                    </div>
                </COSCard>
            </div>

            {/* Standards Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    VCSS Standards Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {standards.map((standard) => (
                        <COSCard
                            key={standard.id}
                            variant="default"
                            interactive
                            onClick={() => onSelectStandard(standard.id)}
                            className="flex flex-col h-full"
                        >
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Standard {standard.id}
                                    </span>
                                    <StatusBadge status={standard.status} />
                                </div>
                                <h4 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                                    {standard.title}
                                </h4>
                            </div>

                            <div className="mt-auto space-y-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Requirements</span>
                                    <span>
                                        {standard.requirements.filter(r => r.completed).length}/{standard.requirements.length}
                                    </span>
                                </div>
                                <Progress
                                    value={(standard.requirements.filter(r => r.completed).length / standard.requirements.length) * 100}
                                    className="h-1.5"
                                />
                            </div>
                        </COSCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: VCSSStandard["status"] }) {
    const configs = {
        compliant: {
            label: "Compliant",
            icon: CheckCircle2,
            className: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        },
        "non-compliant": {
            label: "Non-Compliant",
            icon: AlertCircle,
            className: "text-destructive bg-destructive/10 border-destructive/20",
        },
        "in-progress": {
            label: "In Progress",
            icon: Clock,
            className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        },
        "not-started": {
            label: "Not Started",
            icon: Clock,
            className: "text-muted-foreground bg-muted border-transparent",
        },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </div>
    );
}
