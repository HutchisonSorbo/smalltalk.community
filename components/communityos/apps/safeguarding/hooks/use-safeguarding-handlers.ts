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

import { EvidenceCategorySchema, RiskAssessmentSchema } from "@/lib/communityos/safeguarding/types";

/**
 * Factory for creating an evidence upload handler with validation.
 */
const createUploadEvidenceHandler = (deps: UseSafeguardingHandlersProps) => {
    return async (file: File, category: EvidenceCategory) => {
        const { toast, setIsUploading, selectedStandardId } = deps;

        try {
            // 1. Validation
            if (!file || file.size === 0) {
                toast({ title: "Invalid File", description: "The selected file is empty or missing.", variant: "destructive" });
                return;
            }

            const categoryResult = EvidenceCategorySchema.safeParse(category);
            if (!categoryResult.success) {
                toast({ title: "Invalid Category", description: "The evidence category is not recognised.", variant: "destructive" });
                return;
            }

            // 2. Action with guarded logs
            const standardLog = selectedStandardId ? ` for Standard ${selectedStandardId}` : "";
            console.log(`Uploading ${file.name} to category ${category}${standardLog}`);

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: "Evidence Uploaded",
                description: `${file.name} has been linked and stored.`,
            });
        } catch (error) {
            const standardLog = selectedStandardId ? `Standard ${selectedStandardId}` : "unknown standard";
            console.error(`useSafeguardingHandlers: Failed to upload evidence for ${standardLog}, file=${file?.name} — error:`, error);
            toast({
                title: "Upload Failed",
                description: "There was an error saving your evidence. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };
};

/**
 * Factory for creating a risk assessment completion handler with validation.
 */
const createRiskCompleteHandler = (deps: UseSafeguardingHandlersProps) => {
    return async (data: RiskAssessment | RiskAssessmentInput) => {
        const { toast, setView, selectedStandardId } = deps;

        try {
            // 1. Validation
            const validationResult = RiskAssessmentSchema.safeParse(data);
            if (!validationResult.success) {
                console.error("useSafeguardingHandlers: Risk assessment validation failed", validationResult.error);
                toast({
                    title: "Validation Error",
                    description: "Please check the assessment details and try again.",
                    variant: "destructive",
                });
                return;
            }

            // 2. Action with guarded logs
            const dataSummary = JSON.stringify(data).substring(0, 200);
            const standardLog = selectedStandardId ? ` for Standard ${selectedStandardId}` : "";
            console.log(`Risk Assessment Complete${standardLog}:`, dataSummary);

            await new Promise(resolve => setTimeout(resolve, 500));
            setView("dashboard");
            toast({
                title: "Assessment Saved",
                description: "Child safety risk assessment has been recorded.",
            });
        } catch (error) {
            const dataSummary = JSON.stringify(data).substring(0, 200);
            const standardLog = selectedStandardId ? `Standard ${selectedStandardId}` : "unknown standard";
            console.error(`useSafeguardingHandlers: Failed to save risk assessment for ${standardLog}, data=${dataSummary} — error:`, error);
            toast({
                title: "Error Saving Assessment",
                description: "Could not record the assessment. Please check your data and try again.",
                variant: "destructive",
            });
        }
    };
};

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
export function useSafeguardingHandlers(props: UseSafeguardingHandlersProps) {
    const handleUploadEvidence = createUploadEvidenceHandler(props);
    const handleRiskComplete = createRiskCompleteHandler(props);

    return {
        handleUploadEvidence,
        handleRiskComplete
    };
}


