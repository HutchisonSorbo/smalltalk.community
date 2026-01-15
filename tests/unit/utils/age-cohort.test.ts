import { describe, it, expect } from 'vitest';
import { getAgeCohort, calculateAge } from '@/utils/age-cohort';

describe('Age Cohort Utilities', () => {
    describe('calculateAge', () => {
        it('calculates correct age from birthdate', () => {
            const today = new Date();
            const birth = new Date(today);
            birth.setFullYear(today.getFullYear() - 20);
            expect(calculateAge(birth)).toBe(20);
        });
    });

    describe('getAgeCohort', () => {
        it('throws error for age < 13', () => {
            expect(() => getAgeCohort(12)).toThrow();
            expect(() => getAgeCohort(5)).toThrow();
        });

        it('returns Teen for 13-17', () => {
            expect(getAgeCohort(13)).toBe('Teen');
            expect(getAgeCohort(17)).toBe('Teen');
        });

        it('returns Adult for 18-64', () => {
            expect(getAgeCohort(18)).toBe('Adult');
            expect(getAgeCohort(64)).toBe('Adult');
        });

        it('returns Senior for 65+', () => {
            expect(getAgeCohort(65)).toBe('Senior');
        });

        it('returns Invalid for negative/NaN', () => {
            expect(getAgeCohort(-1)).toBe('Invalid');
            expect(getAgeCohort(NaN)).toBe('Invalid');
        });
    });
});
