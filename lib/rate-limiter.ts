import { db } from "../server/db";
import { rateLimits } from "../shared/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Check if a user or identifier has exceeded the rate limit.
 * @param key - The user ID or IP address
 * @param type - The action type
 * @param limit - Maximum allowed hits
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(key: string, type: string, limit: number = 10, windowSeconds: number = 60): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    // Determine if key is UUID (userId) or other (identifier/IP)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);

    const whereClause = isUuid
        ? and(eq(rateLimits.userId, key), eq(rateLimits.type, type))
        : and(eq(rateLimits.identifier, key), eq(rateLimits.type, type));

    const records = await db.select().from(rateLimits).where(whereClause);
    let record = records[0];

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
