import { describe, it, expect } from 'vitest';
import { calculateRiskLevel } from '@/lib/engagement';

describe('Engagement Risk', () => {
    it('assigns Green risk for recent contact', () => {
        const today = new Date().toISOString();
        expect(calculateRiskLevel({ engagement: { lastContactDate: today } })).toBe('Green');
    });

    it('assigns Red risk for no contact', () => {
        expect(calculateRiskLevel({})).toBe('Red');
    });
});
