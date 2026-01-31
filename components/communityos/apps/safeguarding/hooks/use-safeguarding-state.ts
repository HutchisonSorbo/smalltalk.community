"use client";

import { useRef } from "react";
import { create } from "zustand";
import { VCSS_STANDARDS } from "@/lib/communityos/safeguarding/vcss-standards";
import { VCSSStandard, ViewState } from "@/lib/communityos/safeguarding/types";

interface SafeguardingState {
    view: ViewState;
    selectedStandardId: number | null;
    standards: VCSSStandard[];
    isUploading: boolean;

    // Actions
    setView: (view: ViewState) => void;
    setSelectedStandardId: (id: number | null) => void;
    setStandards: (standards: VCSSStandard[]) => void;
    setIsUploading: (isUploading: boolean) => void;
    handleToggleRequirement: (standardId: number, requirementId: string) => void;
}

/**
 * Zustand store for Safeguarding module state.
 */
const useSafeguardingStore = create<SafeguardingState>((set) => ({
    view: "dashboard",
    selectedStandardId: null,
    standards: VCSS_STANDARDS,
    isUploading: false,

    setView: (view) => set({ view }),
    setSelectedStandardId: (selectedStandardId) => set({ selectedStandardId }),
    setStandards: (standards) => set({ standards }),
    setIsUploading: (isUploading) => set({ isUploading }),
    handleToggleRequirement: (standardId, requirementId) => set((state) => ({
        standards: state.standards.map(s => {
            if (s.id !== standardId) return s;
            return {
                ...s,
                requirements: s.requirements.map(r =>
                    r.id === requirementId ? { ...r, completed: !r.completed } : r
                )
            };
        })
    })),
}));

/**
 * Manages the core state for the Safeguarding module.
 * Tracks view navigation, selected standards, and modal visibility.
 * 
 * @returns Object containing state and actions selected from the Zustand store.
 */
export function useSafeguardingState() {
    const state = useSafeguardingStore();
    const modalRef = useRef<HTMLDivElement>(null);

    const selectedStandard = state.selectedStandardId
        ? state.standards.find(s => s.id === state.selectedStandardId)
        : null;

    return {
        ...state,
        modalRef,
        selectedStandard
    };
}

