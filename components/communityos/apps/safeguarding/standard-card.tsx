"use client";

import React from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { VCSSStandard } from "@/lib/communityos/safeguarding/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUp, History, Calendar, AlertCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardDetailCardProps {
    standard: VCSSStandard;
    onBack: () => void;
    onToggleRequirement: (requirementId: string) => void;
    onUploadEvidence: () => void;
}

export function StandardDetailCard({
    standard,
    onBack,
    onToggleRequirement,
    onUploadEvidence,
}: StandardDetailCardProps) {
    const completedCount = standard.requirements.filter((r) => r.completed).length;

    return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 max-w-full">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            <COSCard variant="elevated" className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold border-primary text-primary">
                                Standard {standard.id}
                            </Badge>
                            <h2 className="text-xl font-bold line-clamp-1" title={standard.title}>{standard.title}</h2>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2" title={standard.description}>
                            {standard.description}
                        </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold border",
                            standard.status === 'compliant' ? "bg-green-50 text-green-700 border-green-200" :
                                standard.status === 'in-progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-gray-50 text-gray-700 border-gray-200"
                        )}>
                            {standard.status.toUpperCase()}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            Last Reviewed: {standard.lastReviewed || 'Never'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Requirements */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Requirements Checklist ({completedCount}/{standard.requirements.length})
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {standard.requirements.map((req) => (
                                <div
                                    key={req.id}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                        req.completed ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800/20" : "bg-card border-border"
                                    )}
                                >
                                    <Checkbox
                                        id={req.id}
                                        checked={req.completed}
                                        onCheckedChange={() => onToggleRequirement(req.id)}
                                        className="mt-1"
                                    />
                                    <div className="space-y-1">
                                        <label
                                            htmlFor={req.id}
                                            className={cn(
                                                "text-sm font-medium leading-relaxed cursor-pointer",
                                                req.completed && "text-muted-foreground line-through decoration-green-300 dark:decoration-green-800"
                                            )}
                                        >
                                            {req.text}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Actions & Meta */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" className="w-full justify-start gap-2" onClick={onUploadEvidence}>
                                    <FileUp className="h-4 w-4" />
                                    Upload Evidence
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Schedule Review
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <History className="h-4 w-4" />
                                    View History
                                </Button>
                            </div>
                        </div>

                        <COSCard variant="glass" className="p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase text-primary">Compliance Tip</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ensure you have evidence for each requirement. Evidence can include meeting minutes, signed policies, or training certificates.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <AlertCircle className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-medium">Victorian Legal Requirement</span>
                            </div>
                        </COSCard>
                    </div>
                </div>
            </COSCard>
        </div>
    );
}
