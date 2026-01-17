import { describe, it, expect } from 'vitest';
import { cn, safeUrl } from '@/lib/utils';

describe('safeUrl', () => {
    it('should allow http and https protocols', () => {
        expect(safeUrl('https://example.com')).toBe('https://example.com/');
        expect(safeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should allow mailto protocol', () => {
        expect(safeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should reject other protocols', () => {
        expect(safeUrl('javascript:alert(1)')).toBeUndefined();
        expect(safeUrl('data:text/plain,hello')).toBeUndefined();
    });

    it('should handle invalid URLs', () => {
        expect(safeUrl('not-a-url')).toBeUndefined();
    });

    it('should handle null and undefined', () => {
        expect(safeUrl(null)).toBeUndefined();
        expect(safeUrl(undefined)).toBeUndefined();
    });
});
