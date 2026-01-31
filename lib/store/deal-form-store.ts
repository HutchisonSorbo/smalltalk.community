
import { create } from "zustand";
import type { CrmDeal } from "@/types/crm";

interface DealFormState {
    formData: Partial<CrmDeal>;
    isSaving: boolean;
    setFormData: (data: Partial<CrmDeal>) => void;
    updateField: (field: keyof CrmDeal, value: unknown) => void;
    setIsSaving: (isSaving: boolean) => void;
    reset: () => void;
}

export const useDealStore = create<DealFormState>((set) => ({
    formData: {},
    isSaving: false,
    setFormData: (data) => set({ formData: data }),
    updateField: (field, value) => set((state) => ({
        formData: { ...state.formData, [field]: value }
    })),
    setIsSaving: (isSaving) => set({ isSaving }),
    reset: () => set({ formData: {}, isSaving: false }),
}));
