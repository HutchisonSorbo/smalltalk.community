import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase-server';
import { insertAuditLog } from '@/lib/audit/auditLog';
import { moderateContent } from '@/lib/utils/moderation';

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

// Simple In-Memory Rate Limiter (Fallback)
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(userId);
    if (!record || now > record.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
    record.count++;
    return true;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
}

function sanitizeText(text: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing ASCII control characters
    return text.replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) return '';
        return parsed.toString();
    } catch { return ''; }
}

async function validateFileContent(file: File): Promise<boolean> {
    try {
        const signature = FILE_SIGNATURES[file.type];
        if (!signature) return false;

        const buffer = await file.slice(0, signature.length).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        return signature.every((byte, index) => bytes[index] === byte);
    } catch (error) {
        console.error(`File validation error for ${sanitizeFileName(file.name)} (${file.type}):`, error);
        await insertAuditLog({
            eventType: 'security', severity: 'error', message: 'File validation exception',
            safeQueryParams: { fileName: sanitizeFileName(file.name), type: file.type, error: String(error) }
        });
        return false;
    }
}

function performSafetyChecks(title?: string, text?: string, url?: string, userAgeGroups?: string[]): { safe: boolean; reason?: string } {
    const combined = `${title || ''} ${text || ''} ${url || ''}`;
    // Simulated checks
    if (combined.toLowerCase().includes('unsafe_content_placeholder')) {
        return { safe: false, reason: 'Content flagged by AI safety check' };
    }
    return { safe: true };
}

// ----------------------------------------------------------------------------
// Route Logic Helpers
// ----------------------------------------------------------------------------

const shareSchema = z.object({
    title: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    text: z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    url: z.string().url().optional().transform(val => val ? sanitizeUrl(val) : undefined),
});

type ShareData = z.infer<typeof shareSchema>;

async function authenticateAndRateLimit(request: NextRequest): Promise<
    { user: any; error: null } | { user: null; error: NextResponse }
> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            await insertAuditLog({
                eventType: 'security', severity: 'warn', message: 'Unauthorized share attempt',
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                safeQueryParams: { reason: 'unauthorized', error: authError?.message }
            });
            return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }) };
        }

        if (!checkRateLimit(user.id)) {
            await insertAuditLog({
                eventType: 'security', severity: 'warn', message: 'Rate limit exceeded',
                userId: user.id, safeQueryParams: { reason: 'rate_limited' }
            });
            return {
                user: null,
                error: NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60' } })
            };
        }

        return { user, error: null };
    } catch (error) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        await insertAuditLog({
            eventType: 'security', severity: 'error', message: 'Auth helper exception',
            ip, safeQueryParams: { error: String(error) }
        });
        return { user: null, error: NextResponse.json({ error: 'Authentication service error' }, { status: 500, headers: CORS_HEADERS }) };
    }
}

async function parseAndValidateForm(request: NextRequest): Promise<
    { data: ShareData; files: File[]; error: null } | { data: null; files: null; error: NextResponse }
> {
    try {
        const formData = await request.formData();
        const rawData = {
            title: formData.get('title') as string | null,
            text: formData.get('text') as string | null,
            url: formData.get('url') as string | null,
        };

        // Zod validation for files
        const rawFiles = formData.getAll('files');
        const filesSchema = z.array(z.custom<File>((v) => v instanceof File, { message: 'Must be a File' }));
        const filesValidation = filesSchema.safeParse(rawFiles);

        if (!filesValidation.success) {
            await insertAuditLog({
                eventType: 'security', severity: 'warn', message: 'Share file validation failed',
                safeQueryParams: { reason: 'invalid_file_format', errors: filesValidation.error }
            });
            return { data: null, files: null, error: NextResponse.json({ error: 'Invalid files provided' }, { status: 400, headers: CORS_HEADERS }) };
        }

        const validationResult = shareSchema.safeParse({
            title: rawData.title || undefined,
            text: rawData.text || undefined,
            url: rawData.url || undefined,
        });

        if (!validationResult.success) {
            await insertAuditLog({
                eventType: 'security', severity: 'warn', message: 'Share validation failed',
                safeQueryParams: { reason: 'validation_failed', errors: validationResult.error }
            });
            return { data: null, files: null, error: NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: CORS_HEADERS }) };
        }

        return { data: validationResult.data, files: filesValidation.data, error: null };
    } catch (e) {
        return { data: null, files: null, error: NextResponse.json({ error: 'Form parse error' }, { status: 400, headers: CORS_HEADERS }) };
    }
}

async function validateUploadedFiles(files: File[]): Promise<{ validFiles: File[]; invalidFiles: string[]; rejectedResponse?: NextResponse }> {
    try {
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
            const safeName = sanitizeFileName(file.name);
            if (file.size > MAX_FILE_SIZE) {
                invalidFiles.push(`${safeName} (too large)`);
                continue;
            }

            const isValidContent = await validateFileContent(file);
            if (!isValidContent) {
                invalidFiles.push(`${safeName} (invalid content/type)`);
                continue;
            }
            validFiles.push(file);
        }

        if (invalidFiles.length > 0) {
            await insertAuditLog({
                eventType: 'security', severity: 'info', message: 'Share files rejected',
                safeQueryParams: { reason: 'files_rejected', count: invalidFiles.length, names: invalidFiles }
            });
            if (validFiles.length === 0 && files.length > 0) {
                return {
                    validFiles, invalidFiles,
                    rejectedResponse: NextResponse.json({ error: 'All uploaded files were rejected' }, { status: 400, headers: CORS_HEADERS })
                };
            }
        }

        return { validFiles, invalidFiles };
    } catch (error) {
        await insertAuditLog({
            eventType: 'security', severity: 'error', message: 'File validation exception',
            safeQueryParams: { reason: 'exception', error: String(error) }
        });
        return {
            validFiles: [], invalidFiles: [],
            rejectedResponse: NextResponse.json({ error: 'File validation failed' }, { status: 500, headers: CORS_HEADERS })
        };
    }
}

// ----------------------------------------------------------------------------
// Handlers
// ----------------------------------------------------------------------------

/**
 * OPTIONS handler for CORS preflight.
 * @param _request The incoming OPTIONS request (unused).
 * @returns 204 No Content with CORS headers.
 */
export async function OPTIONS(_request: NextRequest) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST handler for the PWA Share Target API.
 * Accepts multipart/form-data with title, text, url, and files.
 * Performs auth, rate limiting, moderation, and validation before processing.
 * @param request The incoming POST request.
 * @returns JSON response with success/error status and CORS headers.
 */
export async function POST(request: NextRequest) {
    let contextUserId: string | undefined;
    let contextIp: string | undefined;

    try {
        const { user, error: authError } = await authenticateAndRateLimit(request);
        if (authError) return authError;

        // Capture context for error logging
        contextUserId = user.id;
        contextIp = request.headers.get('x-forwarded-for') || 'unknown';

        const { data, files, error: valError } = await parseAndValidateForm(request);
        if (valError) return valError;

        // Moderation
        const safety = performSafetyChecks(data.title, data.text, data.url, user.app_metadata?.age_groups);
        if (!safety.safe) {
            await insertAuditLog({
                eventType: 'security', severity: 'warn', message: 'Content moderation blocked share',
                userId: user.id, safeQueryParams: { reason: safety.reason }
            });
            return NextResponse.json({ error: 'Content flagged by safety checks' }, { status: 400, headers: CORS_HEADERS });
        }

        const { validFiles, invalidFiles, rejectedResponse } = await validateUploadedFiles(files || []);
        if (rejectedResponse) return rejectedResponse;

        // Log final success
        await insertAuditLog({
            eventType: 'security', severity: 'info', message: 'User shared content via PWA',
            userId: user.id, ip: contextIp,
            safeQueryParams: {
                hasTitle: !!data.title, hasText: !!data.text, hasUrl: !!data.url,
                fileCount: validFiles.length, invalidFileCount: invalidFiles.length,
                fileTypes: validFiles.map(f => f.type)
            }
        });

        // Mock Process (DB insert would be here)

        return NextResponse.json({ success: true, message: 'Shared successfully' }, { headers: CORS_HEADERS });

    } catch (error) {
        console.error('Share API Error', error);
        await insertAuditLog({
            eventType: 'security', severity: 'error', message: 'Share API Exception',
            userId: contextUserId, ip: contextIp,
            safeQueryParams: { reason: 'exception', error: String(error) }
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS });
    }
}
