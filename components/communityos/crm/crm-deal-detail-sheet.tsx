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
import { DollarSign, Calendar, Info, Clock } from "lucide-react";

interface Deal {
    id: string;
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
    deal: Deal | null;
    stages: Stage[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (deal: Deal) => Promise<void>;
    onDelete?: (dealId: string) => Promise<void>;
}

export function CRMDealDetailSheet({
    deal,
    stages,
    isOpen,
    onClose,
    onSave,
    onDelete
}: Props) {
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
        } finally {
            setIsSaving(false);
        }
    };

    if (!deal && isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{deal ? "Edit Deal" : "New Deal"}</SheetTitle>
                    <SheetDescription>
                        Update the details of this deal to track its progress.
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
                                value={formData.probability || ""}
                                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
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
                                value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ""}
                                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value ? new Date(e.target.value) : null })}
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
                    {deal && onDelete && (
                        <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:mr-auto"
                            onClick={() => onDelete(deal.id)}
                        >
                            Delete Deal
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Deal"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
