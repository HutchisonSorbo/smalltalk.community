import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase-server';
import { insertAuditLog } from '@/lib/audit/auditLog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File Signatures (Magic Bytes)
const FILE_SIGNATURES: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // R-I-F-F
    'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
};

// CORS Headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Or restrict to specific domains if needed
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple In-Memory Rate Limiter (Fallback since no KV/Upstash)
// Map<userId, { count: number, resetTime: number }>
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(userId);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    record.count++;
    return true;
}

// Validation schema for shared data
const shareSchema = z.object({
    title: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    text: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    url: z.string().url().optional().transform(val => val ? sanitizeUrl(val) : undefined),
});

function sanitizeText(text: string): string {
    // Basic sanitization - remove HTML tags and control characters
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing ASCII control characters
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

async function validateFileContent(file: File): Promise<boolean> {
    const signature = FILE_SIGNATURES[file.type];
    if (!signature) return false;

    const buffer = await file.slice(0, signature.length).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return signature.every((byte, index) => bytes[index] === byte);
}

export async function OPTIONS(_request: NextRequest) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
    try {
        // 1. Auth & CSRF Check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Share API: Unauthorized access attempt', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
        }

        // 2. Rate Limiting
        if (!checkRateLimit(user.id)) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60' } }
            );
        }

        // 3. Parse FormData
        const formData = await request.formData();
        const title = formData.get('title') as string | null;
        const text = formData.get('text') as string | null;
        const url = formData.get('url') as string | null;
        const files = formData.getAll('files') as File[];

        // 4. Input Validation
        const validationResult = shareSchema.safeParse({
            title: title || undefined,
            text: text || undefined,
            url: url || undefined,
        });

        if (!validationResult.success) {
            console.error('Share API: Validation failed', validationResult.error);
            return NextResponse.json({ error: 'Invalid data provided' }, { status: 400, headers: CORS_HEADERS });
        }

        const { data } = validationResult;

        // 5. File Validation (Content-based)
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                invalidFiles.push(`${file.name} (too large)`);
                continue;
            }

            const isValidContent = await validateFileContent(file);
            if (!isValidContent) {
                invalidFiles.push(`${file.name} (invalid content/type)`);
                continue;
            }
            validFiles.push(file);
        }

        if (invalidFiles.length > 0) {
            console.warn('Share API: Some files were rejected', invalidFiles);
            if (validFiles.length === 0 && files.length > 0) {
                return NextResponse.json({ error: 'All uploaded files were rejected' }, { status: 400, headers: CORS_HEADERS });
            }
        }

        // 6. Audit Logging & Processing
        // Log the event securely
        await insertAuditLog({
            eventType: 'security',
            severity: 'info',
            message: 'User shared content via PWA Share Target',
            userId: user.id,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            safeQueryParams: {
                hasTitle: !!data.title,
                hasText: !!data.text,
                hasUrl: !!data.url,
                fileCount: validFiles.length,
                invalidFileCount: invalidFiles.length,
                fileTypes: validFiles.map(f => f.type)
            }
        });

        // Mock processing (DB insert would go here)
        // console.log('Processed Shared Data', ...); 

        return NextResponse.json({ success: true, message: 'Shared successfully' }, { headers: CORS_HEADERS });

    } catch (error) {
        console.error('Share API: Processing error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS });
    }
}
