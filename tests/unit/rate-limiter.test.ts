import { describe, it, expect } from 'vitest';
import {
    DEFAULT_LIMIT,
    DEFAULT_WINDOW_SECONDS,
    UUID_PATTERN,
    isValidUuid,
    isWindowExpired,
    calculateRemaining,
    isAllowed,
    calculateResetTime
} from '../../lib/rate-limiter';

/**
 * Rate Limiter Utility Tests
 * 
 * These tests validate the rate limiting utilities and constants
 * exported from the rate-limiter module.
 */
describe('rate-limiter utilities', () => {
    describe('constants', () => {
        it('DEFAULT_LIMIT should be 10', () => {
            expect(DEFAULT_LIMIT).toBe(10);
        });

        it('DEFAULT_WINDOW_SECONDS should be 60', () => {
            expect(DEFAULT_WINDOW_SECONDS).toBe(60);
        });

        it('defaults should be positive values', () => {
            expect(DEFAULT_LIMIT).toBeGreaterThan(0);
            expect(DEFAULT_WINDOW_SECONDS).toBeGreaterThan(0);
        });

        it('UUID_PATTERN should be a valid RegExp', () => {
            expect(UUID_PATTERN).toBeInstanceOf(RegExp);
        });
    });

    describe('isValidUuid', () => {
        it('should identify valid UUIDs', () => {
            const validUuids = [
                '123e4567-e89b-12d3-a456-426614174000',
                'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
                '00000000-0000-0000-0000-000000000000',
            ];

            for (const uuid of validUuids) {
                expect(isValidUuid(uuid), `${uuid} should be valid UUID`).toBe(true);
            }
        });

        it('should reject invalid UUIDs', () => {
            const invalidUuids = [
                '192.168.1.1',
                '10.0.0.1',
                'not-a-uuid',
                '123e4567-e89b-12d3-a456',
                'g23e4567-e89b-12d3-a456-426614174000', // 'g' is invalid hex
                '',
                'null',
            ];

            for (const uuid of invalidUuids) {
                expect(isValidUuid(uuid), `${uuid} should be invalid UUID`).toBe(false);
            }
        });
    });

    describe('isWindowExpired', () => {
        it('should return true for expired windows', () => {
            const windowSeconds = 60;
            const expiredWindowStart = new Date(Date.now() - (windowSeconds + 10) * 1000);

            expect(isWindowExpired(expiredWindowStart, windowSeconds)).toBe(true);
        });

        it('should return false for active windows', () => {
            const windowSeconds = 60;
            const activeWindowStart = new Date(Date.now() - 30 * 1000); // 30 seconds ago

            expect(isWindowExpired(activeWindowStart, windowSeconds)).toBe(false);
        });

        it('should handle edge case at exact expiry time', () => {
            const windowSeconds = 60;
            // Window started exactly 60 seconds ago should be expired
            const exactExpiry = new Date(Date.now() - windowSeconds * 1000 - 1);

            expect(isWindowExpired(exactExpiry, windowSeconds)).toBe(true);
        });
    });

    describe('calculateRemaining', () => {
        it('should calculate correct remaining quota', () => {
            expect(calculateRemaining(7, 10)).toBe(3);
            expect(calculateRemaining(0, 10)).toBe(10);
            expect(calculateRemaining(10, 10)).toBe(0);
        });

        it('should return 0 when limit exceeded', () => {
            expect(calculateRemaining(15, 10)).toBe(0);
            expect(calculateRemaining(100, 10)).toBe(0);
        });

        it('should never return negative values', () => {
            const result = calculateRemaining(999, 10);
            expect(result).toBeGreaterThanOrEqual(0);
        });
    });

    describe('isAllowed', () => {
        it('should allow requests within limit', () => {
            expect(isAllowed(1, 10)).toBe(true);
            expect(isAllowed(5, 10)).toBe(true);
            expect(isAllowed(10, 10)).toBe(true);
        });

        it('should block requests exceeding limit', () => {
            expect(isAllowed(11, 10)).toBe(false);
            expect(isAllowed(15, 10)).toBe(false);
            expect(isAllowed(100, 10)).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isAllowed(0, 0)).toBe(true); // 0 hits, 0 limit
            expect(isAllowed(1, 0)).toBe(false); // 1 hit, 0 limit
        });
    });

    describe('calculateResetTime', () => {
        it('should calculate correct reset time', () => {
            const windowSeconds = 60;
            const windowStart = new Date();
            const resetAt = calculateResetTime(windowStart, windowSeconds);

            const expectedReset = windowStart.getTime() + windowSeconds * 1000;
            expect(resetAt.getTime()).toBe(expectedReset);
        });

        it('should add windowSeconds to windowStart', () => {
            const windowStart = new Date('2026-01-08T12:00:00Z');
            const windowSeconds = 120;
            const resetAt = calculateResetTime(windowStart, windowSeconds);

            expect(resetAt.toISOString()).toBe('2026-01-08T12:02:00.000Z');
        });
    });
});

/**
 * Note: Full integration tests for checkRateLimit and getRateLimitRemaining
 * with database should be run against a test database instance in e2e tests.
 */
