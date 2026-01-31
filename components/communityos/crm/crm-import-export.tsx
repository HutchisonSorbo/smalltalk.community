"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseCsv, generateCsv, mapCsvToContacts } from "@/lib/communityos/csvUtils";

/** Maximum file size for CSV imports (5MB) */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
}

interface CRMImportExportProps {
    contacts: Contact[];
    onImport: (contacts: Omit<Contact, "id">[]) => Promise<void>;
}

/**
 * Reusable utility to trigger a file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function CRMImportExport({ contacts, onImport }: CRMImportExportProps) {
    return (
        <div className="flex items-center gap-2">
            <CRMExportDialog contacts={contacts} />
            <CRMImportDialog onImport={onImport} />
        </div>
    );
}

function CRMExportDialog({ contacts }: { contacts: Contact[] }) {
    const handleExport = () => {
        const exportData = contacts.map((c) => ({
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone,
        }));

        const csv = generateCsv(exportData, [
            { key: "firstName", header: "First Name" },
            { key: "lastName", header: "Last Name" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone" },
        ]);

        const filename = `crm-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
        downloadFile(csv, filename, "text/csv;charset=utf-8;");
        toast.success(`Exported ${contacts.length} contacts`);
    };

    return (
        <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={contacts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}

function CRMImportDialog({ onImport }: { onImport: (contacts: Omit<Contact, "id">[]) => Promise<void> }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState<"upload" | "map" | "preview">("upload");
    const [file, setFile] = React.useState<File | null>(null);
    const [headers, setHeaders] = React.useState<string[]>([]);
    const [rows, setRows] = React.useState<Record<string, string>[]>([]);
    const [mapping, setMapping] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const [errors, setErrors] = React.useState<string[]>([]);
    const [isImporting, setIsImporting] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            toast.error("Please select a CSV file");
            return;
        }

        try {
            setFile(selectedFile);
            const text = await selectedFile.text();
            const result = parseCsv(text);

            setHeaders(result.headers);
            setRows(result.rows);
            setErrors(result.errors);

            const autoMap = { firstName: "", lastName: "", email: "", phone: "" };
            result.headers.forEach((h) => {
                const lower = h.toLowerCase();
                if (lower.includes("first") && lower.includes("name")) autoMap.firstName = h;
                if (lower.includes("last") && lower.includes("name")) autoMap.lastName = h;
                if (lower.includes("email")) autoMap.email = h;
                if (lower.includes("phone") || lower.includes("mobile")) autoMap.phone = h;
            });
            setMapping(autoMap);

            if (result.rows.length > 0) {
                setStep("map");
            } else {
                toast.error("No data rows found in the CSV file");
            }
        } catch (err) {
            console.error("[CRMImportDialog] handleFileChange failed:", err);
            toast.error("Failed to read the CSV file");
            setFile(null);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const mappedContacts = mapCsvToContacts(rows, mapping);
            await onImport(mappedContacts);
            toast.success(`Imported ${mappedContacts.length} contacts`);
            setIsOpen(false);
            resetState();
        } catch (error) {
            toast.error("Import failed");
            console.error("[CRMImportDialog] Import error:", error);
        } finally {
            setIsImporting(false);
        }
    };

    const resetState = () => {
        setStep("upload");
        setFile(null);
        setHeaders([]);
        setRows([]);
        setMapping({ firstName: "", lastName: "", email: "", phone: "" });
        setErrors([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription>
                        {step === "upload" && "Upload a CSV file to import contacts."}
                        {step === "map" && "Map CSV columns to contact fields."}
                        {step === "preview" && `Ready to import ${rows.length} contacts.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {step === "upload" && <FileUploader onFileChange={handleFileChange} />}
                    {step === "map" && (
                        <MappingTable
                            rowsCount={rows.length}
                            fileName={file?.name || ""}
                            headers={headers}
                            mapping={mapping}
                            errors={errors}
                            onMappingChange={setMapping}
                        />
                    )}
                    {step === "preview" && <ImportPreview rowsCount={rows.length} />}
                </div>

                <DialogFooter className="shrink-0 pt-4 border-t">
                    {step === "map" && (
                        <Button type="button" onClick={() => setStep("preview")} disabled={!mapping.firstName || !mapping.lastName}>
                            Continue
                        </Button>
                    )}
                    {step === "preview" && (
                        <>
                            <Button type="button" variant="outline" onClick={() => setStep("map")} disabled={isImporting}>Back</Button>
                            <Button type="button" onClick={handleImport} disabled={isImporting}>
                                {isImporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : "Import"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FileUploader({ onFileChange }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="grid gap-4">
            <Label htmlFor="csv-file" className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">CSV File</Label>
            <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer relative focus-within:ring-2 focus-within:ring-primary/20">
                <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">Click or drag CSV file here</p>
                <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={onFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Upload CSV file"
                />
            </div>
        </div>
    );
}

function MappingTable({
    rowsCount,
    fileName,
    headers,
    mapping,
    errors,
    onMappingChange
}: {
    rowsCount: number;
    fileName: string;
    headers: string[];
    mapping: { firstName: string; lastName: string; email: string; phone: string };
    errors: string[];
    onMappingChange: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; email: string; phone: string }>>;
}) {
    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source File</p>
                    <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rows</p>
                    <p className="text-sm font-bold text-primary">{rowsCount}</p>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                        <p className="font-bold uppercase text-[10px] tracking-widest mb-1">Warnings</p>
                        <ul className="list-disc list-inside text-xs space-y-0.5">
                            {errors.slice(0, 3).map((err, i) => <li key={i} className="truncate">{err}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Field Mapping</p>
                {(["firstName", "lastName", "email", "phone"] as const).map((field) => (
                    <div key={field} className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor={`map-${field}`} className="capitalize font-medium">{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                        <Select
                            value={mapping[field]}
                            onValueChange={(val) => onMappingChange((m) => ({ ...m, [field]: val }))}
                        >
                            <SelectTrigger id={`map-${field}`} className="h-9">
                                <SelectValue placeholder="Skip field" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">-- Skip --</SelectItem>
                                {headers.map((h) => (
                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ImportPreview({ rowsCount }: { rowsCount: number }) {
    return (
        <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <p className="text-xl font-bold">Ready to Import</p>
            <p className="text-sm text-muted-foreground mt-1">{rowsCount} contacts will be added to your CRM.</p>
            <div className="mt-6 p-4 text-[10px] items-center gap-2 inline-flex border rounded-full bg-background font-bold text-muted-foreground uppercase tracking-widest">
                <AlertCircle className="h-3 w-3 text-amber-500" aria-hidden="true" />
                This action cannot be undone
            </div>
        </div>
    );
}
