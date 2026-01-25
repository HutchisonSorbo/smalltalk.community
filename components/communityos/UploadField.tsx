"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { uploadTenantImage } from "@/lib/communityos/upload-action";
import { updateTenantProfile } from "@/lib/communityos/actions";
import { useRouter } from "next/navigation";
import { safeUrl } from "@/lib/utils";

interface UploadFieldProps {
    tenantId: string;
    label: string;
    type: "logo" | "hero";
    initialUrl?: string | null;
    recommendation: string;
    className?: string;
}

export function UploadField({ tenantId, label, type, initialUrl, recommendation, className }: UploadFieldProps) {
    const [currentUrl, setCurrentUrl] = useState(initialUrl);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadTenantImage(tenantId, formData, type);
            if (res.success && res.url) {
                const updateRes = await updateTenantProfile(tenantId, {
                    [type === "logo" ? "logoUrl" : "heroImageUrl"]: res.url
                });

                if (updateRes.success) {
                    setCurrentUrl(res.url);
                    toast.success(`${label} updated`);
                    router.refresh(); // Refresh server state without full page reload
                } else {
                    toast.error(updateRes.error || `Failed to save ${type} reference`);
                }
            } else {
                toast.error(res.error || "Upload failed");
            }
        } catch (err) {
            console.error(`[UploadField] error for ${type}:`, err);
            toast.error("An unexpected error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <FormLabel>{label}</FormLabel>
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
                {currentUrl ? (
                    <img
                        src={safeUrl(currentUrl)}
                        alt={`${label} preview`}
                        className={type === "logo" ? "h-32 w-32 object-contain rounded-lg shadow-sm" : "h-32 w-full object-cover rounded-lg shadow-sm"}
                    />
                ) : (
                    <div className={type === "logo" ? "h-32 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400" : "h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400"}>
                        No {label}
                    </div>
                )}
                <div className="flex flex-col w-full gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={onChange}
                        disabled={isUploading}
                    />
                    <p className="text-xs text-gray-500">{recommendation}</p>
                </div>
            </div>
        </div>
    );
}
