/*
  Extracted from server/routes.ts
*/

// Allowed MIME types for image uploads
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];

// Magic bytes for image validation
export const IMAGE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, WebP has WEBP after
};

export function validateImageMagicBytes(buffer: Buffer | Uint8Array, mimetype: string): boolean {
    const signatures = IMAGE_SIGNATURES[mimetype];
    if (!signatures) return false;

    for (const signature of signatures) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
            if (buffer[i] !== signature[i]) {
                matches = false;
                break;
            }
        }
        if (matches) {
            if (mimetype === 'image/webp') {
                return buffer.length > 11 &&
                    buffer[8] === 0x57 && // W
                    buffer[9] === 0x45 && // E
                    buffer[10] === 0x42 && // B
                    buffer[11] === 0x50; // P
            }
            return true;
        }
    }
    return false;
}

// CodeRabbit Audit Trigger
