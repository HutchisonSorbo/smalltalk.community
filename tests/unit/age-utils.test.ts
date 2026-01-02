import { describe, it, expect } from 'vitest';
import { isOver18 } from '@/lib/ageUtils';

describe('ageUtils', () => {
    describe('isOver18', () => {
        it('should return true for users over 18', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25);

            expect(isOver18(birthDate)).toBe(true);
        });

        it('should return true for users exactly 18', () => {
            const today = new Date();
            const birthDate = new Date(
                today.getFullYear() - 18,
                today.getMonth(),
                today.getDate()
            );

            expect(isOver18(birthDate)).toBe(true);
        });

        it('should return false for users under 18', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 15);

            expect(isOver18(birthDate)).toBe(false);
        });

        it('should return false for users just under 18', () => {
            const today = new Date();
            // One day before 18th birthday
            const birthDate = new Date(
                today.getFullYear() - 18,
                today.getMonth(),
                today.getDate() + 1
            );

            expect(isOver18(birthDate)).toBe(false);
        });

        it('should handle string date input', () => {
            const birthYear = new Date().getFullYear() - 25;
            const dateString = `${birthYear}-06-15`;

            expect(isOver18(dateString)).toBe(true);
        });

        it('should return false for null input', () => {
            expect(isOver18(null)).toBe(false);
        });

        it('should return false for undefined input', () => {
            expect(isOver18(undefined)).toBe(false);
        });

        it('should handle edge case for 13-year-olds (minimum age)', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 13);

            expect(isOver18(birthDate)).toBe(false);
        });

        it('should handle seniors (65+)', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 70);

            expect(isOver18(birthDate)).toBe(true);
        });
    });
});
