"use client";

import React from "react";
import { useTenant } from "@/components/communityos/TenantProvider";
import { useModeration } from "@/hooks/use-moderation";
import { Shield, LayoutDashboard, History, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ComplianceDashboard } from "./safeguarding/compliance-dashboard";
import { StandardDetailCard } from "./safeguarding/standard-card";
import { AuditLogView } from "./safeguarding/audit-log";
import { ExpiryTracker } from "./safeguarding/expiry-alerts";
import { EvidenceUploader } from "./safeguarding/evidence-uploader";
import { RiskAssessmentWizard } from "./safeguarding/risk-wizard";
import { useSafeguarding, ViewState } from "./safeguarding/use-safeguarding";
import { VCSSStandard, EvidenceCategory } from "@/lib/communityos/safeguarding/types";

export function SafeguardingCentre() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const { moderatedContent: moderatedTenantName, isLoading: isModerationLoading } = useModeration(tenant?.name || "");
    const logic = useSafeguarding();

    if (isTenantLoading || (tenant && isModerationLoading)) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6 max-w-full">
            <Header view={logic.view} setView={logic.setView} tenantName={moderatedTenantName} />
            <main className="min-h-[500px]">
                <MainContent logic={logic} />
            </main>
        </div>
    );
}

function Header({ view, setView, tenantName }: { view: ViewState; setView: (v: ViewState) => void; tenantName: string }) {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, variant: "ghost" as const, hideOn: "dashboard" as ViewState },
        { id: "expiry-alerts", label: "Expiry Alerts", icon: Clock, variant: "outline" as const },
        { id: "audit-log", label: "Audit Log", icon: History, variant: "outline" as const },
    ];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
                    <h2 className="text-2xl font-bold tracking-tight">Safeguarding Centre</h2>
                </div>
                <p className="text-muted-foreground text-sm">{tenantName}&apos;s Compliance Suite</p>
            </div>
            <div className="flex items-center gap-2">
                {navItems.map(item => (view !== item.hideOn) && (
                    <Button key={item.id} variant={view === item.id ? "secondary" : item.variant} size="sm" onClick={() => setView(item.id as ViewState)} className="gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Button>
                ))}
                <Button size="sm" className="gap-2" onClick={() => setView("risk-wizard")}>
                    <AlertTriangle className="h-4 w-4" /> New Risk Assessment
                </Button>
            </div>
        </div>
    );
}

function MainContent({ logic }: { logic: ReturnType<typeof useSafeguarding> }) {
    const { view, setView, selectedStandard, setSelectedStandardId, standards, isUploading, setIsUploading, credentials, modalRef, incidentsCount, expiringCredentialsCount, auditLogs, handleToggleRequirement, handleUploadEvidence, handleRiskComplete } = logic;

    switch (view) {
        case "dashboard":
            return <ComplianceDashboard standards={standards} incidentsCount={incidentsCount} expiringCredentialsCount={expiringCredentialsCount} onSelectStandard={(id) => { setSelectedStandardId(id); setView("standard-detail"); }} />;
        case "standard-detail":
            return selectedStandard && (
                <div className="space-y-6">
                    <StandardDetailCard standard={selectedStandard} onBack={() => setView("dashboard")} onToggleRequirement={(reqId) => handleToggleRequirement(selectedStandard.id, reqId)} onUploadEvidence={() => setIsUploading(true)} />
                    {isUploading && <UploadModal modalRef={modalRef} setIsUploading={setIsUploading} selectedStandard={selectedStandard} handleUploadEvidence={handleUploadEvidence} />}
                </div>
            );
        case "risk-wizard":
            return <RiskAssessmentWizard onComplete={handleRiskComplete} onCancel={() => setView("dashboard")} />;
        case "audit-log":
            return <AuditLogView logs={auditLogs} />;
        case "expiry-alerts":
            return <ExpiryTracker credentials={credentials} />;
        default:
            return null;
    }
}

function UploadModal({ modalRef, setIsUploading, selectedStandard, handleUploadEvidence }: { modalRef: React.RefObject<HTMLDivElement | null>; setIsUploading: (b: boolean) => void; selectedStandard: VCSSStandard; handleUploadEvidence: (file: File, category: EvidenceCategory) => Promise<void> }) {
    return (
        <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300 outline-none" onKeyDown={(e) => { if (e.key === "Escape") setIsUploading(false); }}>
            <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200">
                <EvidenceUploader standardId={selectedStandard.id} onUpload={handleUploadEvidence} onClose={() => setIsUploading(false)} />
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="p-4 space-y-4">
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
            <div className="h-32 w-full bg-gray-100 animate-pulse rounded" />
        </div>
    );
}