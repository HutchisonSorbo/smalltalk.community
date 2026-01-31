"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

const dealSchema = z.object({
    title: z.string().min(1, "Deal title is required").max(255),
    pipelineStageId: z.string().min(1, "Pipeline stage is required"),
    value: z.number().nullable().optional(),
    probability: z.number().min(0).max(100).nullable().optional(),
    expectedCloseDate: z.date().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

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
        setIsSaving(true);
        try {
            const validatedData = dealSchema.parse({
                ...formData,
                title: (formData.title || "").trim(),
                notes: formData.notes?.trim() || null,
            });

            await onSave({
                ...formData,
                ...validatedData,
            } as CrmDeal);
            onClose();
        } catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0].message);
            } else {
                console.error("[useDealForm] handleSave error:", err);
                toast.error("Failed to save deal");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleProbabilityChange = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, "");
        if (cleaned === "") {
            updateField("probability", null);
            return;
        }
        const parsed = parseInt(cleaned, 10);
        if (isNaN(parsed)) {
            updateField("probability", null);
            return;
        }
        const clamped = Math.max(0, Math.min(100, parsed));
        updateField("probability", clamped);
    };

    const handleValueChange = (value: string) => {
        // Allow decimals but strip invalid characters
        const cleaned = value.replace(/[^0-9.]/g, "");
        // Prevent multiple dots
        const parts = cleaned.split(".");
        const sanitized = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned;

        if (sanitized === "" || sanitized === ".") {
            updateField("value", null);
            return;
        }
        const parsed = parseFloat(sanitized);
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
