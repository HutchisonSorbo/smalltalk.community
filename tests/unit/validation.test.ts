import { describe, it, expect } from 'vitest';
import { validateImageMagicBytes, ALLOWED_IMAGE_TYPES, IMAGE_SIGNATURES } from '@/lib/validation';

describe('validation', () => {
    describe('ALLOWED_IMAGE_TYPES', () => {
        it('should include common image types', () => {
            expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
            expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
            expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
            expect(ALLOWED_IMAGE_TYPES).toContain('image/gif');
        });

        it('should not allow dangerous file types', () => {
            expect(ALLOWED_IMAGE_TYPES).not.toContain('application/javascript');
            expect(ALLOWED_IMAGE_TYPES).not.toContain('text/html');
            expect(ALLOWED_IMAGE_TYPES).not.toContain('application/pdf');
        });
    });

    describe('IMAGE_SIGNATURES', () => {
        it('should have signatures for all allowed types', () => {
            ALLOWED_IMAGE_TYPES.forEach(type => {
                expect(IMAGE_SIGNATURES[type]).toBeDefined();
                expect(Array.isArray(IMAGE_SIGNATURES[type])).toBe(true);
            });
        });
    });

    describe('validateImageMagicBytes', () => {
        it('should validate JPEG magic bytes', () => {
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
            expect(validateImageMagicBytes(jpegBuffer, 'image/jpeg')).toBe(true);
        });

        it('should validate PNG magic bytes', () => {
            const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
            expect(validateImageMagicBytes(pngBuffer, 'image/png')).toBe(true);
        });

        it('should validate GIF87a magic bytes', () => {
            const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00, 0x00]);
            expect(validateImageMagicBytes(gifBuffer, 'image/gif')).toBe(true);
        });

        it('should validate GIF89a magic bytes', () => {
            const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00]);
            expect(validateImageMagicBytes(gifBuffer, 'image/gif')).toBe(true);
        });

        it('should validate WebP magic bytes', () => {
            // RIFF....WEBP
            const webpBuffer = Buffer.from([
                0x52, 0x49, 0x46, 0x46, // RIFF
                0x00, 0x00, 0x00, 0x00, // Size placeholder
                0x57, 0x45, 0x42, 0x50  // WEBP
            ]);
            expect(validateImageMagicBytes(webpBuffer, 'image/webp')).toBe(true);
        });

        it('should reject mismatched magic bytes', () => {
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            expect(validateImageMagicBytes(jpegBuffer, 'image/png')).toBe(false);
        });

        it('should reject unknown MIME types', () => {
            const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            expect(validateImageMagicBytes(buffer, 'application/pdf')).toBe(false);
        });

        it('should reject empty buffers', () => {
            const emptyBuffer = Buffer.from([]);
            expect(validateImageMagicBytes(emptyBuffer, 'image/jpeg')).toBe(false);
        });

        it('should reject truncated buffers', () => {
            const truncatedBuffer = Buffer.from([0xFF]); // Only 1 byte
            expect(validateImageMagicBytes(truncatedBuffer, 'image/jpeg')).toBe(false);
        });

        it('should detect spoofed file extensions', () => {
            // Random data claiming to be JPEG
            const fakeJpeg = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            expect(validateImageMagicBytes(fakeJpeg, 'image/jpeg')).toBe(false);
        });
    });
});
