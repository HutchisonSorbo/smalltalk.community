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
import { DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Deal {
    id?: string;
    title: string;
    value: string | null;
    probability: number | null;
    contactId: string | null;
    pipelineStageId: string;
    expectedCloseDate?: Date | null;
    notes?: string | null;
}

interface Stage {
    id: string;
    name: string;
}

interface Props {
    deal: Partial<Deal> | null;
    stages: Stage[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (deal: Deal) => Promise<void>;
    onDelete?: (dealId: string) => Promise<void>;
}

/**
 * Convert a Date to a local yyyy-mm-dd string for date input
 */
function toLocalDateString(date: Date | null | undefined): string {
    if (!date) return "";
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
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
    const [formData, setFormData] = React.useState<Partial<Deal>>({});
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (deal) {
            setFormData(deal);
        } else {
            setFormData({});
        }
    }, [deal]);

    const handleSave = async () => {
        if (!formData.title || !formData.pipelineStageId) return;
        setIsSaving(true);
        try {
            await onSave(formData as Deal);
            onClose();
        } catch (err) {
            console.error("CRMDealDetailSheet: handleSave failed", err);
            toast.error("Failed to save deal. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setFormData({ ...formData, probability: null });
            return;
        }
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            setFormData({ ...formData, probability: null });
            return;
        }
        const clamped = Math.max(0, Math.min(100, parsed));
        setFormData({ ...formData, probability: clamped });
    };

    const handleDelete = () => {
        if (!deal?.id || !onDelete) return;
        if (window.confirm("Are you sure you want to delete this deal? This action cannot be undone.")) {
            onDelete(deal.id);
        }
    };

    // Only return null when sheet is closed, not when creating a new deal
    if (!isOpen) return null;

    const isNewDeal = !deal?.id;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isNewDeal ? "New Deal" : "Edit Deal"}</SheetTitle>
                    <SheetDescription>
                        {isNewDeal ? "Create a new deal to track in your pipeline." : "Update the details of this deal to track its progress."}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6 font-medium">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Deal Title</Label>
                        <Input
                            id="title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Service Contract for Community Org"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="stage">Pipeline Stage</Label>
                        <Select
                            value={formData.pipelineStageId}
                            onValueChange={(val) => setFormData({ ...formData, pipelineStageId: val })}
                        >
                            <SelectTrigger id="stage">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value ($)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="value"
                                    type="number"
                                    className="pl-9"
                                    value={formData.value || ""}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="probability">Probability (%)</Label>
                            <Input
                                id="probability"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.probability ?? ""}
                                onChange={handleProbabilityChange}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="closeDate">Expected Close Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="closeDate"
                                type="date"
                                className="pl-9"
                                value={toLocalDateString(formData.expectedCloseDate)}
                                onChange={(e) => setFormData({ ...formData, expectedCloseDate: parseLocalDateString(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter any additional details or context..."
                            className="min-h-[100px]"
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                <SheetFooter className="flex-col sm:flex-row gap-3 pt-4">
                    {!isNewDeal && onDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:mr-auto"
                            onClick={handleDelete}
                        >
                            Delete Deal
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Deal"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
