"use client";

import { useState, useRef } from "react";
import { VCSS_STANDARDS } from "@/lib/communityos/safeguarding/vcss-standards";
import { VCSSStandard, ViewState } from "@/lib/communityos/safeguarding/types";

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
