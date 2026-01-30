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
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { parseCsv, generateCsv, mapCsvToContacts } from "@/lib/communityos/csv-utils";

/** Maximum file size for CSV imports (5MB) */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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
        // Map contacts to plain objects for CSV generation
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

        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
            return;
        }

        // Validate file type
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

            // Auto-map common header names
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
            console.error("CRMImportDialog: handleFileChange failed", err);
            toast.error("Failed to read the CSV file. Please check the format.");
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
            toast.error("Import failed. Please try again.");
            console.error("Import error:", error);
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import Contacts from CSV</DialogTitle>
                    <DialogDescription>
                        {step === "upload" && "Upload a CSV file to import contacts."}
                        {step === "map" && "Map csv columns to contact fields."}
                        {step === "preview" && `Ready to import ${rows.length} contacts.`}
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum file size: {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB
                        </p>
                    </div>
                )}

                {step === "map" && (
                    <div className="grid gap-4 py-4">
                        {errors.length > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Warnings:</p>
                                    <ul className="list-disc list-inside">
                                        {errors.slice(0, 3).map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">Found {rows.length} rows in {file?.name}</p>
                        {(["firstName", "lastName", "email", "phone"] as const).map((field) => (
                            <div key={field} className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor={`map-${field}`} className="capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                                <Select
                                    value={mapping[field]}
                                    onValueChange={(val) => setMapping((m) => ({ ...m, [field]: val }))}
                                >
                                    <SelectTrigger id={`map-${field}`}>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map((h) => (
                                            <SelectItem key={h} value={h}>{h}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                )}

                {step === "preview" && (
                    <div className="py-4 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-medium">Ready to import {rows.length} contacts</p>
                        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                    </div>
                )}

                <DialogFooter>
                    {step === "map" && (
                        <Button type="button" onClick={() => setStep("preview")} disabled={!mapping.email}>
                            Continue
                        </Button>
                    )}
                    {step === "preview" && (
                        <>
                            <Button type="button" variant="outline" onClick={() => setStep("map")}>Back</Button>
                            <Button type="button" onClick={handleImport} disabled={isImporting}>
                                {isImporting ? "Importing..." : "Import"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
