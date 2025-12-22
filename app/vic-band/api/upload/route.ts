import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { validateImageMagicBytes, ALLOWED_IMAGE_TYPES } from "@/lib/validation";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";

export async function POST(request: Request) {
    try {
        // 1. Verify User Authentication using the standard client (honors auth cookies)
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // V-03 REMEDIATION: Rate Limiting (10 uploads per hour)
        const isAllowed = await storage.checkRateLimit(user.id, 'upload', 10, 3600);
        if (!isAllowed) {
            return NextResponse.json({ message: "Rate limit exceeded. Please try again later." }, { status: 429 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 });
        }

        // Validate MIME type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({ message: "Only image files (JPEG, PNG, WebP, GIF) are allowed" }, { status: 400 });
        }

        // validate magic bytes
        const buffer = Buffer.from(await file.arrayBuffer());
        if (!validateImageMagicBytes(buffer, file.type)) {
            return NextResponse.json({ message: "Invalid image file: content does not match file type" }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${randomUUID()}.${fileExt}`;

        // 2. Upload using Service Role Client (Bypasses RLS)
        // We use the service role key to ensure the upload succeeds regardless of RLS policies,
        // since we have already authenticated the user above.
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Upload to Supabase Storage
        const { error: uploadError } = await adminSupabase.storage
            .from('uploads')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase storage upload error:", JSON.stringify(uploadError, null, 2));
            return NextResponse.json({ message: "Failed to upload file to storage", error: uploadError }, { status: 500 });
        }

        const { data: { publicUrl } } = adminSupabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
    }
}
