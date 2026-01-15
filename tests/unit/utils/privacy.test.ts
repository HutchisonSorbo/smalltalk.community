import { describe, it, expect } from 'vitest';
import { requiresParentalConsent, canShareData } from '@/utils/privacy';

describe('Privacy', () => {
    it('requires parental consent for minors', () => {
        expect(requiresParentalConsent(15)).toBe(true);
        expect(requiresParentalConsent(20)).toBe(false);
    });

    it('respects data sharing consent', () => {
        expect(canShareData({ privacy: { dataSharingConsent: true } })).toBe(true);
        expect(canShareData({ privacy: { dataSharingConsent: false } })).toBe(false);
    });
});
