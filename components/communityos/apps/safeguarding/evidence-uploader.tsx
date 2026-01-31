"use client";

import React, { useState, useCallback } from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EvidenceCategory, EvidenceCategorySchema } from "@/lib/communityos/safeguarding/types";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EvidenceUploaderProps {
    standardId: number;
    onUpload: (file: File, category: EvidenceCategory) => Promise<void>;
    onClose: () => void;
}

export function EvidenceUploader({
    standardId,
    onUpload,
    onClose,
}: EvidenceUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<EvidenceCategory>("policy");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            setError(null);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);
        setError(null);

        try {
            // Manual progress simulation if the actual upload doesn't provide it
            const interval = setInterval(() => {
                setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
            }, 200);

            await onUpload(file, category);

            clearInterval(interval);
            setUploadProgress(100);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload evidence.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <COSCard variant="elevated" className="max-w-md w-full mx-auto relative overflow-hidden">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={onClose}
                disabled={uploading}
            >
                <X className="h-4 w-4" />
            </Button>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold">Upload Evidence</h3>
                    <p className="text-xs text-muted-foreground">
                        Linking documentation to Standard {standardId}
                    </p>
                </div>

                {!success ? (
                    <>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors",
                                file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                        >
                            {file ? (
                                <>
                                    <FileText className="h-10 w-10 text-primary" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs h-7">
                                        Remove
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Click or drag to upload</p>
                                        <p className="text-[10px] text-muted-foreground">PDF, DOC, PNG, JPG (Max 10MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        id="evidence-file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                                    />
                                    <Button variant="outline" size="sm" asChild>
                                        <label htmlFor="evidence-file" className="cursor-pointer">Select File</label>
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                                <Select value={category} onValueChange={(val) => setCategory(val as EvidenceCategory)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="policy">Policy Document</SelectItem>
                                        <SelectItem value="training">Training Record</SelectItem>
                                        <SelectItem value="audit">Audit Log</SelectItem>
                                        <SelectItem value="other">Other Evidence</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1.5" />
                                </div>
                            )}

                            <Button
                                className="w-full"
                                disabled={!file || uploading}
                                onClick={handleUpload}
                            >
                                {uploading ? "Processing..." : "Complete Upload"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-300">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold">Evidence Linked Successfully</p>
                            <p className="text-xs text-muted-foreground">Standard {standardId} has been updated.</p>
                        </div>
                    </div>
                )}
            </div>
        </COSCard>
    );
}
