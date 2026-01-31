"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DollarSign, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { useDealForm } from "@/hooks/use-deal-form";
import { COSModal } from "../ui/cos-modal";
import type { CrmDeal, CrmPipelineStage } from "@/types/crm";

interface Props {
    deal: Partial<CrmDeal> | null;
    stages: CrmPipelineStage[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (deal: CrmDeal) => Promise<void>;
    onDelete?: (dealId: string) => Promise<void>;
}

/**
 * Convert a Date to a local yyyy-mm-dd string for date input
 */
function toLocalDateString(date: Date | string | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Parse a yyyy-mm-dd string to a local Date (avoiding timezone shift)
 */
function parseLocalDateString(dateString: string): Date | null {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

export function CRMDealDetailSheet({ deal, stages, isOpen, onClose, onSave, onDelete }: Props) {
    const {
        formData,
        isSaving,
        updateField,
        handleSave,
        handleProbabilityChange,
        handleValueChange
    } = useDealForm({ initialDeal: deal, onSave, onClose });

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!deal?.id || !onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(deal.id);
            setIsConfirmDeleteOpen(false);
            onClose();
        } catch (err) {
            console.error("[CRMDealDetailSheet] handleDelete error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;
    const isNewDeal = !deal?.id;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="truncate">{isNewDeal ? "New Deal" : "Edit Deal"}</SheetTitle>
                        <SheetDescription className="truncate">
                            {isNewDeal ? "Create a new deal to track in your pipeline." : "Update the details of this deal to track its progress."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        <DealForm
                            formData={formData}
                            stages={stages}
                            onUpdateField={updateField}
                            onProbabilityChange={handleProbabilityChange}
                            onValueChange={handleValueChange}
                        />
                    </div>

                    <SheetFooter className="flex-col sm:flex-row gap-3 pt-4 border-t mt-4">
                        {!isNewDeal && onDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:mr-auto"
                                onClick={() => setIsConfirmDeleteOpen(true)}
                                disabled={isSaving || isDeleting}
                            >
                                Delete Deal
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving || isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || isDeleting || !formData.title?.trim() || !formData.pipelineStageId}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : "Save Deal"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <COSModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                title="Delete Deal"
                description="Are you sure you want to delete this deal? This action cannot be undone."
            >
                <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg mb-6">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Full historical data for this deal will be removed.</p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsConfirmDeleteOpen(false)} disabled={isDeleting}>
                        Keep Deal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </Button>
                </div>
            </COSModal>
        </>
    );
}

interface DealFormProps {
    formData: Partial<CrmDeal>;
    stages: CrmPipelineStage[];
    onUpdateField: (field: keyof CrmDeal, value: any) => void;
    onProbabilityChange: (value: string) => void;
    onValueChange: (value: string) => void;
}

function DealForm({ formData, stages, onUpdateField, onProbabilityChange, onValueChange }: DealFormProps) {
    return (
        <div className="grid grid-cols-1 gap-6 font-medium">
            <COSInput
                id="title"
                label="Deal Title"
                value={formData.title || ""}
                onChange={(val) => onUpdateField("title", val)}
                placeholder="e.g., Service Contract for Community Org"
                className="font-bold"
                required
            />

            <div className="grid gap-2">
                <Label htmlFor="stage" className="text-sm font-semibold text-foreground/80 ml-1">
                    Pipeline Stage <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                    value={formData.pipelineStageId}
                    onValueChange={(val) => onUpdateField("pipelineStageId", val)}
                >
                    <SelectTrigger id="stage" className="h-12 rounded-xl border-input">
                        <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                    <SelectContent>
                        {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Responsive grid for numeric values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <COSInput
                    id="value"
                    label="Value ($)"
                    type="number"
                    icon={<DollarSign className="h-4 w-4" />}
                    value={formData.value?.toString() ?? ""}
                    onChange={onValueChange}
                    placeholder="0.00"
                />
                <COSInput
                    id="probability"
                    label="Probability (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability?.toString() ?? ""}
                    onChange={onProbabilityChange}
                    placeholder="0-100"
                />
            </div>

            <COSInput
                id="closeDate"
                label="Expected Close Date"
                type="date"
                icon={<Calendar className="h-4 w-4" />}
                value={toLocalDateString(formData.expectedCloseDate)}
                onChange={(val) => onUpdateField("expectedCloseDate", parseLocalDateString(val))}
            />

            <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-foreground/80 ml-1">Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="Enter any additional details or context..."
                    className="min-h-[120px] resize-none rounded-xl border-input"
                    value={formData.notes || ""}
                    onChange={(e) => onUpdateField("notes", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-right">
                    Optional
                </p>
            </div>
        </div>
    );
}
