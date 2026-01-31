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
    const levels = [5, 4, 3, 2, 1];

    return (
        <div className="space-y-4">
            <div className="relative isolate">
                {/* Y-Axis Label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 origin-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Likelihood
                </div>

                <div className="grid grid-cols-5 gap-1 aspect-square w-full max-w-[300px]">
                    {levels.map((l) => (
                        <React.Fragment key={`row-${l}`}>
                            {[1, 2, 3, 4, 5].map((i) => {
                                const riskLevel = getRiskLevel(l, i);
                                return (
                                    <div
                                        key={`${l}-${i}`}
                                        className={cn(
                                            "relative rounded-sm transition-opacity",
                                            riskLevel === 'extreme' ? "bg-red-600" :
                                                riskLevel === 'high' ? "bg-orange-500" :
                                                    riskLevel === 'medium' ? "bg-yellow-400" :
                                                        "bg-green-500",
                                            "hover:opacity-80 cursor-default"
                                        )}
                                    >
                                        {/* Plot Risks */}
                                        {risks.filter(r => r.likelihood === l && r.impact === i).map(r => (
                                            <button
                                                type="button"
                                                key={r.id}
                                                onClick={() => onSelectRisk?.(r.id)}
                                                className={cn(
                                                    "absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] drop-shadow-md transition-transform",
                                                    activeRiskId === r.id ? "scale-125 z-10" : "scale-100"
                                                )}
                                                title={r.label}
                                            >
                                                ●
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                {/* X-Axis Label */}
                <div className="text-center mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Impact
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-[10px] font-bold uppercase tracking-tighter">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" /> Low</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-yellow-400" /> Medium</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500" /> High</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-600" /> Extreme</div>
            </div>
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
