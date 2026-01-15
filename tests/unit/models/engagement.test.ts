import { describe, it, expect } from 'vitest';
import { calculateRiskLevel, getRiskRecommendations } from '@/lib/engagement';

describe('Engagement Utilities', () => {
    describe('calculateRiskLevel', () => {
        it('returns Red for null/undefined member or engagement', () => {
            expect(calculateRiskLevel({} as any)).toBe('Red');
            expect(calculateRiskLevel({ engagement: {} } as any)).toBe('Red');
        });

        it('returns Red for invalid dates', () => {
            expect(calculateRiskLevel({ engagement: { lastContactDate: 'invalid' } })).toBe('Red');
        });

        it('returns Green for < 30 days', () => {
            const date = new Date();
            date.setDate(date.getDate() - 20); // Safe buffer
            expect(calculateRiskLevel({ engagement: { lastContactDate: date.toISOString() } })).toBe('Green');
        });

        it('returns Amber for 30-59 days', () => {
            const date30 = new Date();
            date30.setDate(date30.getDate() - 30);
            expect(calculateRiskLevel({ engagement: { lastContactDate: date30.toISOString() } })).toBe('Amber');

            const date59 = new Date();
            date59.setDate(date59.getDate() - 59);
            expect(calculateRiskLevel({ engagement: { lastContactDate: date59.toISOString() } })).toBe('Amber');
        });

        it('returns Red for >= 60 days', () => {
            const date = new Date();
            date.setDate(date.getDate() - 60);
            expect(calculateRiskLevel({ engagement: { lastContactDate: date.toISOString() } })).toBe('Red');
        });
    });

    describe('getRiskRecommendations', () => {
        it('returns correct recommendations for Green', () => {
            const recs = getRiskRecommendations('Green');
            expect(recs).toContain('Maintain current engagement');
        });

        it('returns correct recommendations for Amber', () => {
            const recs = getRiskRecommendations('Amber');
            expect(recs).toContain('Schedule follow-up contact');
        });

        it('returns correct recommendations for Red', () => {
            const recs = getRiskRecommendations('Red');
            expect(recs).toContain('Immediate outreach required');
        });
    });
});
