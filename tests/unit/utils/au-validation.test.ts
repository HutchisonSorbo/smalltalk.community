import { describe, it, expect } from 'vitest';
import { validatePhone, validatePostcode } from '@/utils/au-validation';

describe('AU Validation', () => {
    it('validates mobile numbers', () => {
        expect(validatePhone('0412345678')).toBe(true);
        expect(validatePhone('0212345678')).toBe(false);
    });

    it('validates Victorian postcodes', () => {
        expect(validatePostcode('3000', 'VIC')).toBe(true);
        expect(validatePostcode('2000', 'VIC')).toBe(false);
    });
});
