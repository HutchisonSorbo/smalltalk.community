"use client";

import { useState, useRef } from "react";
import { VCSS_STANDARDS } from "@/lib/communityos/safeguarding/vcss-standards";
import { VCSSStandard, ViewState } from "@/lib/communityos/safeguarding/types";

/**
 * Manages the core state for the Safeguarding module.
 * Tracks view navigation, selected standards, and modal visibility.
 * 
 * @returns Object containing:
 * - `view`: Current ViewState
 * - `setView`: Navigation setter
 * - `selectedStandardId`: ID of the standard in focus
 * - `standards`: List of VCSS standards and their progress
 * - `isUploading`: Boolean for evidence modal visibility
 * - `modalRef`: Ref for focusing the upload modal
 * - `selectedStandard`: The standard object matching selectedStandardId
 * - `handleToggleRequirement`: Function to toggle a requirement's completion status (standardId, requirementId)
 */
export function useSafeguardingState() {
    const [view, setView] = useState<ViewState>("dashboard");
    const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
    const [standards, setStandards] = useState<VCSSStandard[]>(VCSS_STANDARDS);
    const [isUploading, setIsUploading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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

    return {
        view,
        setView,
        selectedStandardId,
        setSelectedStandardId,
        standards,
        setStandards,
        isUploading,
        setIsUploading,
        modalRef,
        selectedStandard,
        handleToggleRequirement
    };
}
