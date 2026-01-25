"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase-server";
import { isTenantAdmin } from "@/lib/communityos/tenant-context";

export async function uploadTenantImage(tenantId: string, formData: FormData, type: "logo" | "hero") {
    // 1. Auth & Admin Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = await isTenantAdmin(user.id, tenantId);
    if (!isAdmin) return { success: false, error: "Admin privileges required" };

    // 2. File Validation
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file uploaded" };

    // Max size 2MB for logos, 5MB for hero
    const maxSize = type === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return { success: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
    }

    // Supported types
    if (!file.type.startsWith("image/")) {
        return { success: false, error: "Only image files are allowed" };
    }

    // 3. Save File
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "tenants", tenantId);
        await mkdir(uploadDir, { recursive: true });

        // Generate filename
        const extension = file.name.split('.').pop();
        const filename = `${type}-${Date.now()}.${extension}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // 4. Return URL
        return { success: true, url: `/uploads/tenants/${tenantId}/${filename}` };

    } catch (error) {
        console.error("[uploadTenantImage] error:", error);
        return { success: false, error: "Failed to save file" };
    }
}
