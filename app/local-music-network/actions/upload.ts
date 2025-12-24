"use server";

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase-server";

export async function uploadFile(formData: FormData) {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 2. File Validation
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file uploaded" };

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: "File size must be less than 5MB" };
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
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Clean filename
        const filename = `${uniqueSuffix}-${originalName}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // 4. Return URL
        return { success: true, url: `/uploads/${filename}` };

    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to save file" };
    }
}
