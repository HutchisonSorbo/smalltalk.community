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

describe("cn", () => {
    it("should merge multiple class names", () => {
        expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("should handle conditional class names", () => {
        const isTrue = true;
        const isFalse = false;
        expect(cn("px-2", isTrue && "py-1", isFalse && "m-1")).toBe("px-2 py-1");
    });

    it("should handle objects of class names", () => {
        expect(cn({ "px-2": true, "py-1": false })).toBe("px-2");
    });

    it("should resolve tailwind conflicts (tailwind-merge)", () => {
        // tailwind-merge should prefer the last class in the same group
        expect(cn("px-2 px-4")).toBe("px-4");
        expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });

    it("should handle complex merging with conflicts", () => {
        expect(cn("px-2 py-2 p-4")).toBe("p-4");
    });
});
