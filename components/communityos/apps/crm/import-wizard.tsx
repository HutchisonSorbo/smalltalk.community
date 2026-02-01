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
import { Input } from "@/components/ui/input";
import { Loader2, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { CRMContact } from "@/lib/communityos/crm/types";

interface ImportWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (contacts: Partial<CRMContact>[]) => Promise<void>;
}

export function ImportWizard({
    open,
    onOpenChange,
    onImport
}: ImportWizardProps) {
    const [step, setStep] = React.useState(1);
    const [file, setFile] = React.useState<File | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [preview, setPreview] = React.useState<any[]>([]);

    const reset = () => {
        setStep(1);
        setFile(null);
        setPreview([]);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleNext = async () => {
        if (step === 1 && file) {
            setLoading(true);
            // Simulate parsing
            setTimeout(() => {
                setPreview([
                    { firstName: "John", lastName: "Doe", email: "john@example.com", status: "lead" },
                    { firstName: "Jane", lastName: "Smith", email: "jane@example.com", status: "qualified" },
                ]);
                setLoading(false);
                setStep(2);
            }, 800);
        } else if (step === 2) {
            setLoading(true);
            await onImport(preview as any);
            setLoading(false);
            setStep(3);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(reset, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Upload a CSV file to import contacts."}
                        {step === 2 && "Review and map your data."}
                        {step === 3 && "Import complete!"}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="w-full max-w-xs cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Max size 5MB. CSV format only.
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-start text-sm">
                                <AlertTriangle className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                                <p>We found {preview.length} contacts. Columns mapped automatically.</p>
                            </div>
                            <div className="rounded-md border text-xs">
                                <div className="grid grid-cols-4 p-2 bg-muted font-medium">
                                    <div>Name</div>
                                    <div>Email</div>
                                    <div>Status</div>
                                </div>
                                {preview.map((p, i) => (
                                    <div key={i} className="grid grid-cols-4 p-2 border-t">
                                        <div>{p.firstName} {p.lastName}</div>
                                        <div className="col-span-2 overflow-hidden text-ellipsis">{p.email}</div>
                                        <div>{p.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Success!</h3>
                            <p className="text-muted-foreground">Your contacts have been imported.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step < 3 && (
                        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    )}
                    {step === 3 ? (
                        <Button onClick={handleClose}>Done</Button>
                    ) : (
                        <Button onClick={handleNext} disabled={!file || loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {step === 1 ? "Next" : "Import Now"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
