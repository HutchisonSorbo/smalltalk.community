import { describe, it, expect } from 'vitest';
import { profileSetupSchema } from '@/lib/onboarding-schemas';

describe('profileSetupSchema', () => {
    it('should accept valid profile data without DOB', () => {
        const validData = {
            bio: 'Hello world',
            headline: 'Musician',
            location: 'Melbourne'
        };
        const result = profileSetupSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should accept valid profile data with valid DOB (13+)', () => {
        const validData = {
            bio: 'Hello world',
            headline: 'Musician',
            dateOfBirth: '2000-01-01' // 26 years old
        };
        const result = profileSetupSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should reject DOB if user is under 13', () => {
        const today = new Date();
        const under13Year = today.getFullYear() - 10; // 10 years old
        const under13Date = `${under13Year}-01-01`;

        const invalidData = {
            bio: 'Hello world',
            dateOfBirth: under13Date
        };
        const result = profileSetupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('13 years old');
        }
    });

    it('should allow optional fields to be missing', () => {
        const minimalData = {};
        const result = profileSetupSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
    });
});
