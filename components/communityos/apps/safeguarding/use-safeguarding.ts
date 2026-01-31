"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { VCSS_STANDARDS } from "@/lib/communityos/safeguarding/vcss-standards";
import {
    VCSSStandard,
    EvidenceCategory,
    RiskAssessment,
    RiskAssessmentInput,
    Credential
} from "@/lib/communityos/safeguarding/types";

export type ViewState = "dashboard" | "standard-detail" | "risk-wizard" | "audit-log" | "expiry-alerts";

export function useSafeguarding() {
    const { toast } = useToast();
    const [view, setView] = useState<ViewState>("dashboard");
    const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
    const [standards, setStandards] = useState<VCSSStandard[]>(VCSS_STANDARDS);
    const [isUploading, setIsUploading] = useState(false);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    // Mock constants for simplicity (could move to props or fetch later)
    const incidentsCount = 2;
    const expiringCredentialsCount = 3;
    const auditLogs = [
        {
            id: "1",
            user_name: "Mock User",
            action: "Updated Standard 1",
            target_type: "standard" as const,
            target_id: "1",
            details: "Marked 'Leadership Support' as completed.",
            created_at: new Date().toISOString()
        }
    ];

    useEffect(() => {
        async function loadCredentials() {
            try {
                // Simulate API fetch delay
                await new Promise(resolve => setTimeout(resolve, 300));
                const mockCredentials: Credential[] = [
                    {
                        id: "c1",
                        user_name: "Alice Thompson",
                        type: "WWCC (Working with Children)",
                        expiry_date: new Date(Date.now() + 15 * 86400000).toISOString(),
                        status: "expiring-soon"
                    },
                    {
                        id: "c2",
                        user_name: "Bob Roberts",
                        type: "Police Check",
                        expiry_date: new Date(Date.now() - 2 * 86400000).toISOString(),
                        status: "expired"
                    },
                    {
                        id: "c3",
                        user_name: "Claire Smith",
                        type: "First Aid Certification",
                        expiry_date: new Date(Date.now() + 120 * 86400000).toISOString(),
                        status: "valid"
                    }
                ];
                setCredentials(mockCredentials);
            } catch (error) {
                console.error("Error loading credentials in loadCredentials:", error);
                setCredentials([]);
            }
        }
        loadCredentials();
    }, []);

    useEffect(() => {
        if (isUploading) {
            modalRef.current?.focus();
        }
    }, [isUploading]);

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
            console.log(`Uploading ${file.name} to category ${category} for Standard ${selectedStandardId}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: "Evidence Uploaded",
                description: `${file.name} has been linked and stored.`,
            });
            setIsUploading(false);
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

    return {
        view,
        setView,
        selectedStandard,
        setSelectedStandardId,
        standards,
        isUploading,
        setIsUploading,
        credentials,
        modalRef,
        incidentsCount,
        expiringCredentialsCount,
        auditLogs,
        handleToggleRequirement,
        handleUploadEvidence,
        handleRiskComplete
    };
}
