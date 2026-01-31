
import { create } from "zustand";
import type { CrmDeal } from "@/types/crm";

interface DealFormState {
    formData: Partial<CrmDeal>;
    isSaving: boolean;
    setFormData: (data: Partial<CrmDeal>) => void;
    updateField: <K extends keyof CrmDeal>(field: K, value: CrmDeal[K]) => void;
    setIsSaving: (isSaving: boolean) => void;
    reset: () => void;
}

/**
 * Zustand store for managing CRM Deal form state.
 * 
 * @property formData - Current partial deal data
 * @property isSaving - Loading state for save operation
 * @property setFormData - Replace entire form data
 * @property updateField - Update a single field with type safety
 * @property setIsSaving - Set loading state
 * @property reset - Reset store to initial state
 */
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
