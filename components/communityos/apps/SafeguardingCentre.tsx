"use client";

import React, { useState } from "react";
import { useTenant } from "@/components/communityos/TenantProvider";
import { useModeration } from "@/hooks/use-moderation";
import { useToast } from "@/hooks/use-toast";
import { Shield, LayoutDashboard, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// New Safeguarding Components
import { ComplianceDashboard } from "./safeguarding/compliance-dashboard";
import { StandardDetailCard } from "./safeguarding/standard-card";
import { EvidenceUploader } from "./safeguarding/evidence-uploader";
import { AuditLogView } from "./safeguarding/audit-log";
import { ExpiryTracker } from "./safeguarding/expiry-alerts";
import { RiskAssessmentWizard } from "./safeguarding/risk-wizard";

// Data & Types
import { VCSS_STANDARDS } from "@/lib/communityos/safeguarding/vcss-standards";
import {
    VCSSStandard,
    EvidenceCategory,
    RiskAssessment,
    RiskAssessmentInput
} from "@/lib/communityos/safeguarding/types";

type ViewState = "dashboard" | "standard-detail" | "risk-wizard" | "audit-log" | "expiry-alerts";

export function SafeguardingCentre() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const { moderatedContent: moderatedTenantName, isLoading: isModerationLoading } = useModeration(tenant?.name || "");
    const { toast } = useToast();

    const [view, setView] = useState<ViewState>("dashboard");
    const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
    const [standards, setStandards] = useState<VCSSStandard[]>(VCSS_STANDARDS);
    const [isUploading, setIsUploading] = useState(false);

    // Mock data for initial state
    const [incidentsCount] = useState(2);
    const [expiringCredentialsCount] = useState(3);
    const [auditLogs] = useState([
        {
            id: "1",
            user_name: "Mock User",
            action: "Updated Standard 1",
            target_type: "standard" as const,
            target_id: "1",
            details: "Marked 'Leadership Support' as completed.",
            created_at: new Date().toISOString()
        }
    ]);

    const selectedStandard = selectedStandardId
        ? standards.find(s => s.id === selectedStandardId)
        : null;

    const handleToggleRequirement = (standardId: number, requirementId: string) => {
        setStandards(prev => prev.map(s => {
            if (s.id !== standardId) return s;
            return {
                ...s,
                requirements: s.requirements.map(r =>
                    r.id === requirementId ? { ...r, completed: !r.completed } : r
                )
            };
        }));
    };

    const handleUploadEvidence = async (file: File, category: EvidenceCategory) => {
        try {
            // In a real app, this would call a server action or Supabase directly
            console.log(`Uploading ${file.name} to category ${category} for Standard ${selectedStandardId}`);

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Evidence Uploaded",
                description: `${file.name} has been linked and stored.`,
            });
        } catch (error) {
            console.error("Failed to upload evidence:", error);
            toast({
                title: "Upload Failed",
                description: "There was an error saving your evidence. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRiskComplete = async (data: RiskAssessment | RiskAssessmentInput) => {
        try {
            console.log("Risk Assessment Complete:", data);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setView("dashboard");
            toast({
                title: "Assessment Saved",
                description: "Child safety risk assessment has been recorded.",
            });
        } catch (error) {
            console.error("Failed to save risk assessment:", error);
            toast({
                title: "Error Saving Assessment",
                description: "Could not record the assessment. Please check your data and try again.",
                variant: "destructive",
            });
        }
    };

    if (isTenantLoading || (tenant && isModerationLoading)) {
        return (
            <div className="p-4 space-y-4">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
                <div className="h-32 w-full bg-gray-100 animate-pulse rounded" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full">
            {/* Dynamic Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Safeguarding Centre</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {moderatedTenantName}&apos;s VCSS Compliance & Risk Management Suite
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {view !== "dashboard" && (
                        <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setView("audit-log")}
                    >
                        <History className="h-4 w-4" />
                        Audit Log
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setView("risk-wizard")}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        New Risk Assessment
                    </Button>
                </div>
            </div>

            {/* View Switcher */}
            <main className="min-h-[500px]">
                {view === "dashboard" && (
                    <ComplianceDashboard
                        standards={standards}
                        incidentsCount={incidentsCount}
                        expiringCredentialsCount={expiringCredentialsCount}
                        onSelectStandard={(id) => {
                            setSelectedStandardId(id);
                            setView("standard-detail");
                        }}
                    />
                )}

                {view === "standard-detail" && selectedStandard && (
                    <div className="space-y-6">
                        <StandardDetailCard
                            standard={selectedStandard}
                            onBack={() => setView("dashboard")}
                            onToggleRequirement={(reqId) => handleToggleRequirement(selectedStandard.id, reqId)}
                            onUploadEvidence={() => setIsUploading(true)}
                        />
                        {isUploading && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setIsUploading(false);
                                }}
                            >
                                <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200">
                                    <EvidenceUploader
                                        standardId={selectedStandard.id}
                                        onUpload={handleUploadEvidence}
                                        onClose={() => setIsUploading(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === "risk-wizard" && (
                    <RiskAssessmentWizard
                        onComplete={handleRiskComplete}
                        onCancel={() => setView("dashboard")}
                    />
                )}

                {view === "audit-log" && (
                    <AuditLogView logs={auditLogs} />
                )}

                {view === "expiry-alerts" && (
                    <ExpiryTracker credentials={[]} /> // To be populated
                )}
            </main>
        </div>
    );
}