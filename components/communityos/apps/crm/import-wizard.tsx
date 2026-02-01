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
import { sanitizeDisplay } from "@/lib/utils/moderation";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";

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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        const clearFileInput = () => {
            setFile(null);
            e.target.value = '';
        };

        if (selectedFile) {
            // Validation
            if (selectedFile.size > MAX_FILE_SIZE) {
                console.error("File exceeds 5MB limit");
                clearFileInput();
                return;
            }
            if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv' && !selectedFile.type.startsWith('text/')) {
                console.error("Invalid file type. Please upload a CSV.");
                clearFileInput();
                return;
            }
            setFile(selectedFile);
        }
    };

    const parseCsvFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const mapped = results.data.map((row: any) => {
                        // Heuristic mapping
                        const firstName = row.firstName || row['first name'] || row.FirstName || '';
                        const lastName = row.lastName || row['last name'] || row.LastName || '';
                        const email = row.email || row.Email || '';
                        const status = (row.status || row.Status || 'lead').toLowerCase();

                        return {
                            firstName: sanitizeDisplay(firstName),
                            lastName: sanitizeDisplay(lastName),
                            email: sanitizeDisplay(email),
                            status: sanitizeDisplay(status)
                        };
                    });
                    resolve(mapped);
                },
                error: (error) => reject(error)
            });
        });
    };

    const handleNext = async () => {
        if (step === 1 && file) {
            setLoading(true);
            try {
                const parsedData = await parseCsvFile(file);
                setPreview(parsedData.slice(0, 10)); // Preview first 10
                setStep(2);
            } catch (err) {
                console.error("Failed to parse CSV", err);
            } finally {
                setLoading(false);
            }
        } else if (step === 2) {
            setLoading(true);
            try {
                await onImport(preview as any);
                setStep(3);
            } catch (err) {
                console.error("Import failed", err);
            } finally {
                setLoading(false);
            }
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
                            <div className="w-full max-w-xs space-y-2">
                                <Label htmlFor="csv-upload" className="sr-only">Upload CSV file</Label>
                                <Input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                            </div>
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
                            <PreviewList preview={preview} />
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

                <ImportFooter
                    step={step}
                    file={file}
                    loading={loading}
                    onCancel={handleClose}
                    onNext={handleNext}
                />
            </DialogContent>
        </Dialog>
    );
}

function PreviewList({ preview }: { preview: any[] }) {
    return (
        <div className="rounded-md border text-xs overflow-x-auto">
            <div className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 p-2 bg-muted font-medium gap-2">
                    <div>Name</div>
                    <div className="md:col-span-2 text-wrap break-all">Email</div>
                    <div>Status</div>
                </div>
                {preview.map((p, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 p-2 border-t gap-2">
                        <div className="truncate font-medium">{p.firstName} {p.lastName}</div>
                        <div className="md:col-span-2 text-wrap break-all text-muted-foreground">{p.email}</div>
                        <div className="truncate">{p.status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ImportFooterProps {
    step: number;
    file: File | null;
    loading: boolean;
    onCancel: () => void;
    onNext: () => void;
}

function ImportFooter({ step, file, loading, onCancel, onNext }: ImportFooterProps) {
    return (
        <DialogFooter>
            {step < 3 && (
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            )}
            {step === 3 ? (
                <Button onClick={onCancel}>Done</Button>
            ) : (
                <Button onClick={onNext} disabled={!file || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {step === 1 ? "Next" : "Import Now"}
                </Button>
            )}
        </DialogFooter>
    );
}
