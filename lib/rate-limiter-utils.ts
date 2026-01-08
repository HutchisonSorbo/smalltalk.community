/**
 * Rate Limiter Utility Functions
 * 
 * Pure utility functions for rate limiting logic that don't require database access.
 * These are extracted from rate-limiter.ts for testability and reuse.
 */

/** Default rate limit: max requests per window */
export const DEFAULT_LIMIT = 10;

/** Default window duration in seconds */
export const DEFAULT_WINDOW_SECONDS = 60;

/** UUID validation regex pattern */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID format.
 * @param key - The string to validate
 * @returns true if the key is a valid UUID
 */
export function isValidUuid(key: string): boolean {
    return UUID_PATTERN.test(key);
}

/**
 * Check if a rate limit window has expired.
 * @param windowStart - The start of the current window
 * @param windowSeconds - The window duration in seconds
 * @returns true if the window has expired
 */
export function isWindowExpired(windowStart: Date, windowSeconds: number): boolean {
    const expiryTime = new Date(Date.now() - windowSeconds * 1000);
    return windowStart < expiryTime;
}

/**
 * Calculate the remaining quota for a rate limit.
 * @param hits - The current hit count
 * @param limit - The maximum allowed hits
 * @returns The remaining quota (minimum 0)
 */
export function calculateRemaining(hits: number, limit: number): number {
    return Math.max(0, limit - hits);
}

/**
 * Check if a request should be allowed based on hits and limit.
 * @param hits - The current hit count
 * @param limit - The maximum allowed hits
 * @returns true if the request is allowed
 */
export function isAllowed(hits: number, limit: number): boolean {
    return hits <= limit;
}

/**
 * Calculate when the rate limit window will reset.
 * @param windowStart - The start of the current window
 * @param windowSeconds - The window duration in seconds
 * @returns The reset timestamp
 */
export function calculateResetTime(windowStart: Date, windowSeconds: number): Date {
    return new Date(windowStart.getTime() + windowSeconds * 1000);
}
