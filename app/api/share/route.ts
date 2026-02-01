import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase-server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Validation schema for shared data
const shareSchema = z.object({
    title: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    text: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    url: z.string().url().optional().transform(val => val ? sanitizeUrl(val) : undefined),
});

function sanitizeText(text: string): string {
    // Basic sanitization - remove HTML tags and control characters
    return text.replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

function isAllowedFileType(file: File): boolean {
    return ALLOWED_FILE_TYPES.includes(file.type);
}

export async function POST(request: NextRequest) {
    try {
        // 1. Auth & CSRF Check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Share API: Unauthorized access attempt', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // CSRF check (if applicable, though Next.js Server Actions/Handlers usually handle this via headers or standard protections. 
        // Here we can verify Origin/Referer if strictness is needed, but relying on Auth session is primary).
        // For PWA share target, the origin might be the app itself or the share sheet intent.

        // 2. Parse FormData
        const formData = await request.formData();
        const title = formData.get('title') as string | null;
        const text = formData.get('text') as string | null;
        const url = formData.get('url') as string | null;
        const files = formData.getAll('files') as File[];

        // 3. Validation
        const validationResult = shareSchema.safeParse({
            title: title || undefined,
            text: text || undefined,
            url: url || undefined,
        });

        if (!validationResult.success) {
            console.error('Share API: Validation failed', validationResult.error);
            return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
        }

        const { data } = validationResult;

        // 4. File Validation
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                invalidFiles.push(`${file.name} (too large)`);
                continue;
            }
            if (!isAllowedFileType(file)) {
                invalidFiles.push(`${file.name} (invalid type)`);
                continue;
            }
            validFiles.push(file);
        }

        if (invalidFiles.length > 0) {
            console.warn('Share API: Some files were rejected', invalidFiles);
            // We might choose to proceed with valid files or reject the whole request. 
            // Proceeding with partial success is often better for UX, or returning 400.
            if (validFiles.length === 0 && files.length > 0) {
                return NextResponse.json({ error: 'All uploaded files were rejected' }, { status: 400 });
            }
        }

        // 5. Processing (Mocking storage/saving logic here as per requirements which focused on validation layer)
        // In a real app, we would save 'data' and upload 'validFiles' to Supabase Storage.
        console.log('Processed Shared Data:', {
            user: user.id,
            meta: data,
            fileCount: validFiles.length
        });

        // TODO: Insert into database table (e.g., 'shared_items')

        return NextResponse.json({ success: true, message: 'Shared successfully' });

    } catch (error) {
        console.error('Share API: Processing error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
