"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    selectedCount: number;
    onExport: (options: { scope: 'all' | 'selected', format: 'csv' | 'json' }) => void;
}

export function ExportDialog({
    open,
    onOpenChange,
    count,
    selectedCount,
    onExport
}: ExportDialogProps) {
    const [scope, setScope] = React.useState<'all' | 'selected'>('all');
    const [format, setFormat] = React.useState<'csv' | 'json'>('csv');

    React.useEffect(() => {
        if (open) {
            setScope(selectedCount > 0 ? 'selected' : 'all');
        }
    }, [open, selectedCount]);

    const handleExport = () => {
        onExport({ scope, format });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Export Contacts</DialogTitle>
                    <DialogDescription>
                        Download your contact data for use in other applications.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Export Scope</h4>
                        <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="scope-all"
                                    checked={scope === 'all'}
                                    onCheckedChange={() => setScope('all')}
                                />
                                <Label htmlFor="scope-all">All contacts ({count})</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="scope-selected"
                                    checked={scope === 'selected'}
                                    onCheckedChange={() => setScope('selected')}
                                    disabled={selectedCount === 0}
                                />
                                <Label htmlFor="scope-selected" className={selectedCount === 0 ? "text-muted-foreground" : ""}>
                                    Selected contacts ({selectedCount})
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
