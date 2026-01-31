"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { CrmDeal } from "@/types/crm";
import { useDealStore } from "@/lib/store/deal-form-store";

// Use z.coerce.date() to handle ISO strings and Date objects
const dealSchema = z.object({
    title: z.string().min(1, "Deal title is required").max(255),
    pipelineStageId: z.string().min(1, "Pipeline stage is required"),
    value: z.number().min(0, "Value cannot be negative").nullable().optional(),
    probability: z.number().min(0).max(100).nullable().optional(),
    expectedCloseDate: z.coerce.date().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

interface UseDealFormProps {
    initialDeal: Partial<CrmDeal> | null;
    onSave: (deal: Partial<CrmDeal>) => Promise<void>;
    onClose: () => void;
}

/**
 * Parses a string input into a probability number (0-100).
 * 
 * @param value - The raw string input
 * @returns number between 0-100, or null if invalid/empty
 */
export function parseProbability(value: string): number | null {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "") return null;
    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed)) return null;
    return Math.max(0, Math.min(100, parsed));
}

/**
 * Parses a string input into a monetary value.
 * Enforces non-negative values.
 * 
 * @param value - The raw string input (handles multiple decimals by keeping first)
 * @returns number or null if invalid/empty
 */
// Strip non-numeric characters (except dot/minus), parse, and clamp to non-negative
const cleaned = value.replace(/[^0-9.-]/g, "");
const parts = cleaned.split(".");
const sanitized = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned;
if (sanitized === "" || sanitized === ".") return null;
const parsed = parseFloat(sanitized);
if (isNaN(parsed)) return null;
return Math.max(0, parsed);
}

export function useDealForm({ initialDeal, onSave, onClose }: UseDealFormProps) {
    const { formData, isSaving, setFormData, updateField, setIsSaving, reset } = useDealStore();

    React.useEffect(() => {
        setFormData(initialDeal || {});
        return () => reset();
    }, [initialDeal, setFormData, reset]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const validatedData = dealSchema.parse({
                ...formData,
                title: (formData.title || "").trim(),
                notes: formData.notes?.trim() || null,
            });

            await onSave({ ...formData, ...validatedData });
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

    return {
        formData,
        isSaving,
        updateField,
        handleSave,
        handleProbabilityChange: (v: string) => updateField("probability", parseProbability(v)),
        handleValueChange: (v: string) => updateField("value", parseMonetaryValue(v))
    };
}
