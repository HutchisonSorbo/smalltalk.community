"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase-server";
import { isTenantAdmin } from "@/lib/communityos/tenant-context";

/**
 * Validates the first few bytes of a buffer to ensure it matches common image signatures.
 * Supports PNG, JPEG, GIF, and WebP.
 */
function isValidImageMagicBytes(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

    // WebP: RIFF (4 bytes) length (4 bytes) WEBP
    if (buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;

    return false;
}

/**
 * Uploads an image (logo or hero) for a tenant, validating the user's admin status and the file integrity.
 * 
 * @param tenantId - The unique identifier of the tenant. Must be an alphanumeric string.
 * @param formData - The form data containing the file to upload (keyed as "file").
 * @param type - The purpose of the image: "logo" for branding or "hero" for banners.
 * @returns An object indicating success, with the public URL on success or an error message on failure.
 * @throws Never throws directly; captures and returns internal errors as { success: false, error: string }.
 */
export async function uploadTenantImage(
    tenantId: string,
    formData: FormData,
    type: "logo" | "hero"
): Promise<{ success: true; url: string } | { success: false; error: string }> {
    // 1. Sanitize & Validate Tenant ID (Path Traversal Protection)
    if (!/^[A-Za-z0-9_-]+$/.test(tenantId)) {
        return { success: false, error: "Invalid tenant ID format" };
    }

    // 2. Auth & Admin Check
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Authentication required" };

        const isAdmin = await isTenantAdmin(user.id, tenantId);
        if (!isAdmin) return { success: false, error: "Admin privileges required" };

        // 3. File Extraction & Basic Validation
        const file = formData.get("file") as File;
        if (!file || !(file instanceof File)) return { success: false, error: "Invalid file upload" };

        // Max size: 2MB for logos, 5MB for hero
        const maxSize = type === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
        }

        // 4. Extension & Advanced Integrity Check (Magic Bytes)
        const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            return { success: false, error: "Unsupported file extension" };
        }

        // MIME heuristic check
        if (!file.type.startsWith("image/")) {
            return { success: false, error: "MIME type must be an image" };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!isValidImageMagicBytes(buffer)) {
            return { success: false, error: "Security check failed: file is not a valid image" };
        }

        // 5. Save File
        const uploadDir = join(process.cwd(), "public", "uploads", "tenants", tenantId);
        await mkdir(uploadDir, { recursive: true });

        const filename = `${type}-${Date.now()}.${extension}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        return { success: true, url: `/uploads/tenants/${tenantId}/${filename}` };

    } catch (err) {
        console.error(`[uploadTenantImage] failed for tenant ${tenantId}:`, err);
        return { success: false, error: "An error occurred during file upload" };
    }
}
