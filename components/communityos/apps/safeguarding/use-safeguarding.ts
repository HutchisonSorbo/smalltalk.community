"use client";

import { useToast } from "@/hooks/use-toast";
import { useSafeguardingState } from "./hooks/use-safeguarding-state";
import { useCredentialsLoader } from "./hooks/use-credentials-loader";
import { useSafeguardingHandlers } from "./hooks/use-safeguarding-handlers";

export type { ViewState } from "@/lib/communityos/safeguarding/types";

/**
 * React hook that provides safeguarding helpers and state management.
 * 
 * @returns An object containing:
 * - `view`: Current view state (dashboard, standard-detail, etc.)
 * - `setView`: Function to update the current view
 * - `selectedStandard`: currently selected VCSS standard (if any)
 * - `credentials`: List of staff credentials/certifications
 * - `handleRiskComplete`: Function to handle risk assessment completion
 * - `toast`: Helper from useToast
 * - And other state/handlers for the safeguarding module
 */
export function useSafeguarding() {
    const { toast } = useToast();

    // 1. State Management
    const state = useSafeguardingState();

    // 2. Data Loading
    const data = useCredentialsLoader();

    // 3. Handlers
    const handlers = useSafeguardingHandlers({
        toast,
        setIsUploading: state.setIsUploading,
        setView: state.setView,
        selectedStandardId: state.selectedStandardId
    });

    return {
        // Forward state
        view: state.view,
        setView: state.setView,
        selectedStandardId: state.selectedStandardId,
        setSelectedStandardId: state.setSelectedStandardId,
        standards: state.standards,
        selectedStandard: state.selectedStandard, // derived
        isUploading: state.isUploading,
        setIsUploading: state.setIsUploading,
        modalRef: state.modalRef,
        handleToggleRequirement: state.handleToggleRequirement,

        // Forward data
        credentials: data.credentials,
        incidentsCount: data.incidentsCount,
        expiringCredentialsCount: data.expiringCredentialsCount,
        auditLogs: data.auditLogs,

        // Forward handlers
        handleUploadEvidence: handlers.handleUploadEvidence,
        handleRiskComplete: handlers.handleRiskComplete,
    };
}
