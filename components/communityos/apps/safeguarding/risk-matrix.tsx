"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RiskMatrixProps {
    risks: {
        id: string;
        label: string;
        likelihood: number; // 1-5
        impact: number; // 1-5
    }[];
    activeRiskId?: string;
    onSelectRisk?: (id: string) => void;
}

export function RiskMatrix({ risks, activeRiskId, onSelectRisk }: RiskMatrixProps) {
    return (
        <div className="space-y-4 max-w-full">
            <div className="relative isolate">
                {/* Y-Axis Label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 origin-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground" aria-hidden="true">
                    Likelihood
                </div>

                <RiskGrid
                    risks={risks}
                    activeRiskId={activeRiskId}
                    onSelectRisk={onSelectRisk}
                />

                {/* X-Axis Label */}
                <div className="text-center mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground" aria-hidden="true">
                    Impact
                </div>
            </div>

            <RiskLegend />
        </div>
    );
}

interface RiskGridProps {
    risks: RiskMatrixProps["risks"];
    activeRiskId?: string;
    onSelectRisk?: (id: string) => void;
}

function RiskGrid({ risks, activeRiskId, onSelectRisk }: RiskGridProps) {
    const levels = [5, 4, 3, 2, 1];

    return (
        <div className="grid grid-cols-5 gap-1 aspect-square w-full max-w-[300px] border border-border/50 p-1 rounded-md bg-muted/5">
            {levels.map((l) => (
                <React.Fragment key={`row-${l}`}>
                    {[1, 2, 3, 4, 5].map((i) => {
                        const riskLevel = getRiskLevel(l, i);
                        const cellRisks = risks.filter(r => r.likelihood === l && r.impact === i);

                        return (
                            <div
                                key={`${l}-${i}`}
                                className={cn(
                                    "relative rounded-sm transition-opacity aspect-square",
                                    riskLevel === 'extreme' ? "bg-red-600" :
                                        riskLevel === 'high' ? "bg-orange-500" :
                                            riskLevel === 'medium' ? "bg-yellow-400" :
                                                "bg-green-500",
                                    "hover:opacity-80"
                                )}
                            >
                                {cellRisks.map(r => (
                                    <button
                                        type="button"
                                        key={r.id}
                                        onClick={() => onSelectRisk?.(r.id)}
                                        className={cn(
                                            "absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-white",
                                            activeRiskId === r.id ? "scale-125 z-10" : "scale-100"
                                        )}
                                        title={r.label}
                                        aria-label={`Risk Assessment: ${r.label} (Likelihood: ${l}, Impact: ${i}, Level: ${riskLevel})`}
                                    >
                                        <span className="text-[10px]">●</span>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
}

function RiskLegend() {
    return (
        <div className="flex flex-wrap gap-4 justify-center text-[10px] font-bold uppercase tracking-tighter" role="group" aria-label="Risk level legend">
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" /> Low</div>
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true" /> Medium</div>
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" /> High</div>
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-600" aria-hidden="true" /> Extreme</div>
        </div>
    );
}

export function getRiskLevel(likelihood: number, impact: number): 'low' | 'medium' | 'high' | 'extreme' {
    const score = likelihood * impact;
    if (score >= 20) return 'extreme';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
}
