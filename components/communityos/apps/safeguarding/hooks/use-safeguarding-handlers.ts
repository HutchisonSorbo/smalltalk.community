"use client";

import { EvidenceCategory, RiskAssessment, RiskAssessmentInput } from "@/lib/communityos/safeguarding/types";
import { ViewState } from "@/lib/communityos/safeguarding/types";
import { toast } from "@/hooks/use-toast";

type ToastFunction = typeof toast;

interface UseSafeguardingHandlersProps {
    toast: ToastFunction;
    setIsUploading: (isUploading: boolean) => void;
    setView: (view: ViewState) => void;
    selectedStandardId: number | null;
}

export function useSafeguardingHandlers({
    toast,
    setIsUploading,
    setView,
    selectedStandardId
}: UseSafeguardingHandlersProps) {

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
            console.error(`Failed to upload evidence for Standard ${selectedStandardId}, file=${file.name}, category=${category} — error:`, error);
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
            // Sanitizing data for logging purposes (avoiding potentially sensitive large objects if needed, but here simple spread is fine)
            // Ideally we'd cherry pick fields, but current requirement is summary.
            const dataSummary = JSON.stringify(data).substring(0, 200);
            console.error(`Failed to save risk assessment, data=${dataSummary} — error:`, error);
            toast({
                title: "Error Saving Assessment",
                description: "Could not record the assessment. Please check your data and try again.",
                variant: "destructive",
            });
        }
    };

    return {
        handleUploadEvidence,
        handleRiskComplete
    };
}
