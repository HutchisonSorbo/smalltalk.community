import { describe, it, expect } from 'vitest';
import { calculateAge, getAgeCohort } from '@/utils/age-cohort';

describe('Age cohorts', () => {
    it('calculates age correctly', () => {
        const dob = '1990-01-01';
        expect(calculateAge(dob)).toBeGreaterThanOrEqual(30);
    });

    it('assigns correct cohorts', () => {
        expect(getAgeCohort(10)).toBe('Child');
        expect(getAgeCohort(20)).toBe('Youth');
        expect(getAgeCohort(35)).toBe('Adult');
    });
});
