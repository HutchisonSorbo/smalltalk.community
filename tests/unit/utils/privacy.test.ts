import { describe, it, expect } from 'vitest';
import { requiresEnhancedModeration, isConsentValueValid, canShareData, type Member } from '@/utils/privacy';

describe('Privacy Utilities', () => {
    describe('requiresEnhancedModeration', () => {
        it('returns true for teens (13-17)', () => {
            expect(requiresEnhancedModeration(13)).toBe(true);
            expect(requiresEnhancedModeration(17)).toBe(true);
        });

        it('returns false for adults (18+)', () => {
            expect(requiresEnhancedModeration(18)).toBe(false);
            expect(requiresEnhancedModeration(25)).toBe(false);
        });

        it('returns false for children (< 13) - implicit via age check else where', () => {
            // Policy says <13 is invalid, but purely for moderation check:
            expect(requiresEnhancedModeration(12)).toBe(false);
        });
    });

    describe('isConsentValueValid', () => {
        it('returns true for Yes/No', () => {
            expect(isConsentValueValid('Yes')).toBe(true);
            expect(isConsentValueValid('No')).toBe(true);
        });

        it('returns false for other values', () => {
            expect(isConsentValueValid('Maybe')).toBe(false);
            expect(isConsentValueValid('')).toBe(false);
        });
    });

    describe('canShareData', () => {
        it('returns true if explicit consent is true', () => {
            const member: Member = { privacy: { dataSharingConsent: true } };
            expect(canShareData(member)).toBe(true);
        });

        it('returns false if consent is false or missing', () => {
            expect(canShareData({ privacy: { dataSharingConsent: false } })).toBe(false);
            expect(canShareData({ privacy: {} })).toBe(false);
            expect(canShareData({})).toBe(false);
            expect(canShareData(null)).toBe(false);
            expect(canShareData(undefined)).toBe(false);
            // Note: undefined check requires TypeScript "strictNullChecks": false or casting, 
            // but functionally it should work.
        });
    });
});
