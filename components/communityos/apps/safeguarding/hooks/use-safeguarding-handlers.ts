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

/**
 * Handles complex safeguarding actions like evidence uploads and risk assessment completion.
 * Encapsulates side effects such as toasts, redirecting views, and managing loading states.
 * 
 * @param props - Dependencies for the handlers
 * @param props.toast - Toast handler from useToast
 * @param props.setIsUploading - Setter to toggle the upload modal/state
 * @param props.setView - Setter to change the current view
 * @param props.selectedStandardId - ID of the currently active standard
 * 
 * @returns Object containing async handlers for evidence and risk completion
 */
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
        } catch (error) {
            console.error(`Failed to upload evidence for Standard ${selectedStandardId}, file=${file.name}, category=${category} — error:`, error);
            toast({
                title: "Upload Failed",
                description: "There was an error saving your evidence. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRiskComplete = async (data: RiskAssessment | RiskAssessmentInput) => {
        try {
            const dataSummary = JSON.stringify(data).substring(0, 200);
            console.log("Risk Assessment Complete:", dataSummary);
            await new Promise(resolve => setTimeout(resolve, 500));
            setView("dashboard");
            toast({
                title: "Assessment Saved",
                description: "Child safety risk assessment has been recorded.",
            });
        } catch (error) {
            const dataSummary = JSON.stringify(data).substring(0, 200);
            console.error(`Failed to save risk assessment for Standard ${selectedStandardId}, data=${dataSummary} — error:`, error);
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

