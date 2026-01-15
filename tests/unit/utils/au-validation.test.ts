import { describe, it, expect } from 'vitest';
import { validatePhone, validatePostcode, formatAUD } from '@/utils/au-validation';

describe('AU Validation Utilities', () => {
    describe('validatePhone', () => {
        it('validates correct mobile numbers', () => {
            expect(validatePhone('0412345678')).toBe(true);
            expect(validatePhone('04 12 345 678')).toBe(true);
        });

        it('rejects invalid numbers', () => {
            expect(validatePhone('0312345678')).toBe(false); // Landline
            expect(validatePhone('041234567')).toBe(false); // Too short
            expect(validatePhone('abc')).toBe(false);
        });
    });

    describe('validatePostcode', () => {
        it('validates VIC postcodes', () => {
            expect(validatePostcode('3000')).toBe(true);
            expect(validatePostcode('3999')).toBe(true);
            expect(validatePostcode('8000')).toBe(true);
        });

        it('rejects invalid postcodes', () => {
            expect(validatePostcode('2000')).toBe(false); // NSW
            expect(validatePostcode('abc')).toBe(false);
        });
    });

    describe('formatAUD', () => {
        it('formats numbers as currency', () => {
            // Note: Exact string depends on locale, but we expect $ symbol and 2 decimals
            const formatted = formatAUD(1234.5);
            expect(formatted).toContain('1,234.50');
            expect(formatted).toContain('$');
        });

        it('formats zero correctly', () => {
            expect(formatAUD(0)).toContain('0.00');
        });

        it('handles negative numbers', () => {
            expect(formatAUD(-10)).toContain('-$10.00');
        });

        it('returns empty string for invalid input', () => {
            expect(formatAUD(NaN)).toBe('');
        });
    });
});
