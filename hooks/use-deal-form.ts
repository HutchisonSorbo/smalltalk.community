"use client";

import * as React from "react";
import { toast } from "sonner";
import type { CrmDeal } from "@/types/crm";

interface UseDealFormProps {
    initialDeal: Partial<CrmDeal> | null;
    onSave: (deal: CrmDeal) => Promise<void>;
    onClose: () => void;
}

export function useDealForm({ initialDeal, onSave, onClose }: UseDealFormProps) {
    const [formData, setFormData] = React.useState<Partial<CrmDeal>>({});
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (initialDeal) {
            setFormData(initialDeal);
        } else {
            setFormData({});
        }
    }, [initialDeal]);

    const updateField = (field: keyof CrmDeal, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation with trimming
        const title = (formData.title || "").trim();
        if (!title) {
            toast.error("Deal title is required");
            return;
        }

        if (!formData.pipelineStageId) {
            toast.error("Pipeline stage is required");
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                title,
                notes: formData.notes?.trim() || null,
            } as CrmDeal);
            onClose();
        } catch (err) {
            console.error("[useDealForm] handleSave error:", err);
            toast.error("Failed to save deal");
        } finally {
            setIsSaving(false);
        }
    };

    const handleProbabilityChange = (value: string) => {
        if (value === "") {
            updateField("probability", null);
            return;
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            updateField("probability", null);
            return;
        }
        const clamped = Math.max(0, Math.min(100, parsed));
        updateField("probability", clamped);
    };

    const handleValueChange = (value: string) => {
        if (value === "") {
            updateField("value", null);
            return;
        }
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            updateField("value", null);
            return;
        }
        updateField("value", parsed);
    };

    return {
        formData,
        isSaving,
        updateField,
        handleSave,
        handleProbabilityChange,
        handleValueChange
    };
}
