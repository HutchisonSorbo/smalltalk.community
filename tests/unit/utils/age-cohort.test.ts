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

        it('returns age-1 if birthday has not yet occurred this year', () => {
            const today = new Date();
            // Use modulo to avoid month overflow
            const nextMonth = (today.getMonth() + 1) % 12;
            const yearOffset = today.getMonth() === 11 ? 19 : 20; // If Dec, birthday is Jan next year so still 19
            const birth = new Date(today.getFullYear() - yearOffset, nextMonth, today.getDate());
            expect(calculateAge(birth)).toBe(19);
        });

        it('handles leap year birthday (Feb 29)', () => {
            // Feb 29, 2004 was a leap year
            const birth = new Date(2004, 1, 29);
            const today = new Date();
            const expectedAge = today.getFullYear() - 2004 - (today < new Date(today.getFullYear(), 1, 29) ? 1 : 0);
            expect(calculateAge(birth)).toBe(expectedAge);
        });

        it('returns NaN for invalid Date inputs', () => {
            expect(calculateAge(null as any)).toBeNaN();
            expect(calculateAge(new Date('invalid-date'))).toBeNaN();
        });
    });

    describe('getAgeCohort', () => {
        it('returns Invalid for age < 13', () => {
            expect(getAgeCohort(12)).toBe('Invalid');
            expect(getAgeCohort(5)).toBe('Invalid');
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
