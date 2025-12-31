import { db } from "../server/db";
import { rateLimits } from "../shared/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Check if a user has exceeded the rate limit for a specific action.
 * @param userId - The user ID
 * @param type - The action type (e.g., 'onboarding_step', 'api_call')
 * @param limit - Maximum allowed hits
 * @param windowSeconds - Time window in seconds
 * @returns true if allowed, false if limit exceeded
 */
export async function checkRateLimit(userId: string, type: string, limit: number = 10, windowSeconds: number = 60): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    // Find active limit record
    // We assume we reuse the record or create new?
    // Let's find one that started AFTER the window start
    // OR we find the latest one.

    // Simplification: We look for a record for this user/type.
    // If it's old, we reset it. If it's new, we increment.

    // Fetch latest
    const records = await db.select().from(rateLimits)
        .where(and(eq(rateLimits.userId, userId), eq(rateLimits.type, type)));

    let record = records[0];

    if (!record) {
        await db.insert(rateLimits).values({
            userId,
            type,
            hits: 1,
            windowStart: new Date()
        });
        return true;
    }

    if (new Date(record.windowStart) < windowStart) {
        // Window expired, reset
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
