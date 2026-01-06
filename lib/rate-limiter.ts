import { db } from "../server/db";
import { rateLimits } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Check if a user or identifier has exceeded the rate limit.
 * 
 * Optimized implementation per Zapier patterns:
 * - Uses atomic upsert to reduce from 3 DB calls to 1
 * - Handles window expiry in the same query
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
    limit: number = 10,
    windowSeconds: number = 60
): Promise<boolean> {
    // Determine if key is UUID (userId) or other (identifier/IP)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);

    try {
        // Use a single atomic query with INSERT ... ON CONFLICT for efficiency
        // This replaces the previous 3-query pattern (select, then insert or update)
        const result = await db.execute<{ hits: number; is_new_window: boolean }>(sql`
            INSERT INTO rate_limits (user_id, identifier, type, hits, window_start)
            VALUES (
                ${isUuid ? key : null}, 
                ${isUuid ? null : key}, 
                ${type}, 
                1, 
                NOW()
            )
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
            RETURNING hits, (rate_limits.window_start >= NOW() - INTERVAL '1 second' * ${windowSeconds}) as is_new_window
        `);

        // db.execute returns a RowList (array-like), check length directly
        if (!result || result.length === 0) {
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
 * Used when atomic upsert is not available.
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
 */
export async function getRateLimitRemaining(
    key: string,
    type: string,
    limit: number = 10,
    windowSeconds: number = 60
): Promise<{ remaining: number; resetAt: Date }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const whereClause = isUuid
        ? and(eq(rateLimits.userId, key), eq(rateLimits.type, type))
        : and(eq(rateLimits.identifier, key), eq(rateLimits.type, type));

    const records = await db.select().from(rateLimits).where(whereClause);
    const record = records[0];

    if (!record || new Date(record.windowStart) < windowStart) {
        return { remaining: limit, resetAt: new Date(Date.now() + windowSeconds * 1000) };
    }

    const remaining = Math.max(0, limit - record.hits);
    const resetAt = new Date(new Date(record.windowStart).getTime() + windowSeconds * 1000);

    return { remaining, resetAt };
}
