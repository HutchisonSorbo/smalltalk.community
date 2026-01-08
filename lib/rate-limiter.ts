import { db } from "../server/db";
import { rateLimits } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Re-export utilities for backward compatibility
export {
    DEFAULT_LIMIT,
    DEFAULT_WINDOW_SECONDS,
    UUID_PATTERN,
    isValidUuid,
    isWindowExpired,
    calculateRemaining,
    isAllowed,
    calculateResetTime
} from "./rate-limiter-utils";

// Import locally for use in this file
import {
    DEFAULT_LIMIT,
    DEFAULT_WINDOW_SECONDS,
    isValidUuid,
    isWindowExpired,
    calculateRemaining,
    calculateResetTime
} from "./rate-limiter-utils";


/**
 * Check if a user or identifier has exceeded the rate limit.
 * 
 * Optimized implementation per Zapier patterns:
 * - Uses atomic upsert to reduce from 3 DB calls to 1
 * - Handles window expiry in the same query
 * - Properly handles both userId (UUID) and identifier (IP) cases
 * 
 * @param key - The user ID or IP address
 * @param type - The action type
 * @param limit - Maximum allowed hits
 * @param windowSeconds - Time window in seconds
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
    key: string,
    type: string,
    limit: number = DEFAULT_LIMIT,
    windowSeconds: number = DEFAULT_WINDOW_SECONDS
): Promise<boolean> {
    // Determine if key is UUID (userId) or other (identifier/IP)
    const isUuid = isValidUuid(key);

    try {
        // Use separate upsert queries depending on whether we're tracking by userId or identifier
        // This ensures the ON CONFLICT targets the correct unique constraint
        const result = isUuid
            ? await db.execute<{ hits: number }>(sql`
                INSERT INTO rate_limits (user_id, identifier, type, hits, window_start)
                VALUES (${key}, NULL, ${type}, 1, NOW())
                ON CONFLICT (user_id, type) WHERE user_id IS NOT NULL
                DO UPDATE SET 
                    hits = CASE 
                        WHEN rate_limits.window_start < NOW() - INTERVAL '1 second' * ${windowSeconds}
                        THEN 1 
                        ELSE rate_limits.hits + 1 
                    END,
                    window_start = CASE
                        WHEN rate_limits.window_start < NOW() - INTERVAL '1 second' * ${windowSeconds}
                        THEN NOW()
                        ELSE rate_limits.window_start
                    END
                RETURNING hits
            `)
            : await db.execute<{ hits: number }>(sql`
                INSERT INTO rate_limits (user_id, identifier, type, hits, window_start)
                VALUES (NULL, ${key}, ${type}, 1, NOW())
                ON CONFLICT (identifier, type) WHERE identifier IS NOT NULL
                DO UPDATE SET 
                    hits = CASE 
                        WHEN rate_limits.window_start < NOW() - INTERVAL '1 second' * ${windowSeconds}
                        THEN 1 
                        ELSE rate_limits.hits + 1 
                    END,
                    window_start = CASE
                        WHEN rate_limits.window_start < NOW() - INTERVAL '1 second' * ${windowSeconds}
                        THEN NOW()
                        ELSE rate_limits.window_start
                    END
                RETURNING hits
            `);

        // db.execute returns a RowList (array-like), check length directly
        if (!result || result.length === 0) {
            // Upsert didn't return (constraint may not exist), use fallback
            return await checkRateLimitFallback(key, type, limit, windowSeconds, isUuid);
        }

        const { hits } = result[0];
        return hits <= limit;
    } catch (error) {
        // If atomic upsert fails (e.g., missing constraint), use fallback
        console.warn("[RateLimiter] Atomic upsert failed, using fallback:", error);
        return await checkRateLimitFallback(key, type, limit, windowSeconds, isUuid);
    }
}

/**
 * Fallback rate limit check using traditional select/insert/update pattern.
 * Used when atomic upsert is not available (e.g., missing unique constraints).
 */
async function checkRateLimitFallback(
    key: string,
    type: string,
    limit: number,
    windowSeconds: number,
    isUuid: boolean
): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const whereClause = isUuid
        ? and(eq(rateLimits.userId, key), eq(rateLimits.type, type))
        : and(eq(rateLimits.identifier, key), eq(rateLimits.type, type));

    const records = await db.select().from(rateLimits).where(whereClause);
    const record = records[0];

    if (!record) {
        await db.insert(rateLimits).values({
            userId: isUuid ? key : null,
            identifier: isUuid ? null : key,
            type,
            hits: 1,
            windowStart: new Date()
        });
        return true;
    }

    if (new Date(record.windowStart) < windowStart) {
        // Reset window
        await db.update(rateLimits).set({
            hits: 1,
            windowStart: new Date()
        }).where(eq(rateLimits.id, record.id));
        return true;
    }

    if (record.hits >= limit) {
        return false;
    }

    // Increment
    await db.update(rateLimits).set({
        hits: record.hits + 1
    }).where(eq(rateLimits.id, record.id));

    return true;
}

/**
 * Get remaining rate limit quota for a key.
 * Useful for rate limit headers.
 * 
 * @throws Rethrows database errors after logging
 */
export async function getRateLimitRemaining(
    key: string,
    type: string,
    limit: number = DEFAULT_LIMIT,
    windowSeconds: number = DEFAULT_WINDOW_SECONDS
): Promise<{ remaining: number; resetAt: Date }> {
    try {
        const isUuid = isValidUuid(key);
        const windowStart = new Date(Date.now() - windowSeconds * 1000);

        const whereClause = isUuid
            ? and(eq(rateLimits.userId, key), eq(rateLimits.type, type))
            : and(eq(rateLimits.identifier, key), eq(rateLimits.type, type));

        const records = await db.select().from(rateLimits).where(whereClause);
        const record = records[0];

        if (!record || isWindowExpired(new Date(record.windowStart), windowSeconds)) {
            return { remaining: limit, resetAt: calculateResetTime(new Date(), windowSeconds) };
        }

        const remaining = calculateRemaining(record.hits, limit);
        const resetAt = calculateResetTime(new Date(record.windowStart), windowSeconds);

        return { remaining, resetAt };
    } catch (error) {
        // Log error with context but rethrow so caller can handle
        console.error("[RateLimiter] getRateLimitRemaining failed:", {
            key: key.substring(0, 8) + "...", // Truncate for privacy
            type,
            error: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
}
