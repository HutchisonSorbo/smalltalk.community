"use client";

import React, { useState, useCallback, useRef } from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EvidenceCategory } from "@/lib/communityos/safeguarding/types";
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
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (selectedFile: File): string | null => {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            return "Invalid file type. Please upload PDF, Word, PNG, JPG, or WEBP files.";
        }
        if (selectedFile.size > MAX_SIZE) {
            return "File is too large. Maximum size is 10MB.";
        }
        return null;
    };

    const handleFileSelection = useCallback((selectedFile: File | null) => {
        if (!selectedFile) {
            setFile(null);
            setFileError(null);
            return;
        }

        const error = validateFile(selectedFile);
        if (error) {
            setFile(null);
            setFileError(error);
        } else {
            setFile(selectedFile);
            setFileError(null);
            setUploadError(null);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    }, [handleFileSelection]);

    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    }, []);

    const handleUpload = async () => {
        if (!file) {
            setUploadError("No file selected for upload.");
            return;
        }
        if (fileError) {
            setUploadError("Cannot upload due to file validation error.");
            return;
        }

        setUploading(true);
        setUploadProgress(10);
        setUploadError(null);

        try {
            const interval = setInterval(() => {
                setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
            }, 200);

            await onUpload(file, category);

            clearInterval(interval);
            setUploadProgress(100);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            console.error("Upload failed internally:", err);
            setUploadError("Upload failed. Please try again.");
            setUploadProgress(0);
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
                aria-label="Close uploader"
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
                        <EvidenceDropzone
                            file={file}
                            fileError={fileError}
                            uploading={uploading}
                            uploadError={uploadError}
                            fileInputRef={fileInputRef}
                            onFileSelect={handleFileSelection}
                            onKeyDown={onKeyDown}
                            onDrop={onDrop}
                        />

                        <UploadStatus
                            file={file}
                            category={category}
                            setCategory={setCategory}
                            uploading={uploading}
                            uploadProgress={uploadProgress}
                            fileError={fileError}
                            uploadError={uploadError}
                            onUpload={handleUpload}
                        />
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

interface EvidenceDropzoneProps {
    file: File | null;
    fileError: string | null;
    uploading: boolean;
    uploadError: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (file: File | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

function EvidenceDropzone({
    file,
    fileError,
    uploading,
    uploadError,
    fileInputRef,
    onFileSelect,
    onKeyDown,
    onDrop
}: EvidenceDropzoneProps) {
    if (file || uploading) {
        return (
            <>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        onFileSelect(selectedFile || null);
                        e.target.value = '';
                    }}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    title="Evidence file input"
                />
                <div
                    role="region"
                    aria-label={`Selected file: ${file?.name || "Uploading evidence"}`}
                    aria-describedby="file-requirements"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors outline-none",
                        file ? "border-primary bg-primary/5" : "border-border",
                        (fileError || uploadError) && "border-destructive",
                        uploading && "border-primary/50 bg-primary/5 cursor-not-allowed opacity-50"
                    )}
                >
                    {file && (
                        <>
                            <FileText className="h-10 w-10 text-primary" />
                            <div className="text-center">
                                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            {!uploading && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFileSelect(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.stopPropagation();
                                            onFileSelect(null);
                                        }
                                    }}
                                    className="text-xs h-7 px-3 flex items-center justify-center rounded-md hover:bg-muted font-medium transition-colors"
                                >
                                    Remove
                                </div>
                            )}
                        </>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    onFileSelect(selectedFile || null);
                    e.target.value = '';
                }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                title="Evidence file input"
            />
            <div
                role="button"
                aria-label="Click or drag to upload evidence"
                aria-describedby="file-requirements"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onKeyDown={onKeyDown}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary border-border hover:border-primary/50",
                    (fileError || uploadError) && "border-destructive"
                )}
            >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Click or drag to upload</p>
                    <p id="file-requirements" className="text-[10px] text-muted-foreground">PDF, DOC, PNG, JPG (Max 10MB)</p>
                </div>
            </div>
        </>
    );
}

interface UploadStatusProps {
    file: File | null;
    category: EvidenceCategory;
    setCategory: (cat: EvidenceCategory) => void;
    uploading: boolean;
    uploadProgress: number;
    fileError: string | null;
    uploadError: string | null;
    onUpload: () => void;
}

function UploadStatus({
    file,
    category,
    setCategory,
    uploading,
    uploadProgress,
    fileError,
    uploadError,
    onUpload
}: UploadStatusProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="evidence-category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">Category</label>
                <Select value={category} onValueChange={(val) => setCategory(val as EvidenceCategory)} disabled={uploading}>
                    <SelectTrigger id="evidence-category">
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

            {(fileError || uploadError) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {fileError || uploadError}
                </div>
            )}

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" aria-label="Upload progress" />
                </div>
            )}

            <Button
                type="button"
                className="w-full"
                disabled={!file || uploading || !!fileError}
                onClick={onUpload}
            >
                {uploading ? "Processing..." : "Complete Upload"}
            </Button>
        </div>
    );
}
