/**
 * Centralized admin database queries with optimized column selection.
 * 
 * These functions implement best practices:
 * - Select only needed columns (no SELECT *)
 * - Proper error handling with safe defaults
 * - Cache-friendly data shapes
 */

import { db } from "@/server/db";
import { users } from "@shared/schema";
import { sql, desc } from "drizzle-orm";

export interface UserGrowthDataPoint {
    date: string;
    users: number;
    label: string;
}

interface GrowthQueryRow {
    period: string;
    count: string;
}

/**
 * Get user growth data grouped by day/week/month for chart visualization.
 * @param startDate Start of the date range
 * @param endDate End of the date range  
 * @param groupBy How to group the data ('day' | 'week' | 'month')
 */
export async function getUserGrowthData(
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
): Promise<UserGrowthDataPoint[]> {
    try {
        // Determine date_trunc interval based on groupBy
        const truncInterval = groupBy === "day" ? "day" : groupBy === "week" ? "week" : "month";

        const result = await db.execute(
            sql`
                SELECT 
                    TO_CHAR(DATE_TRUNC(${truncInterval}, ${users.createdAt}), 'YYYY-MM-DD') as period,
                    COUNT(*)::text as count
                FROM ${users}
                WHERE ${users.createdAt} >= ${startDate}
                  AND ${users.createdAt} <= ${endDate}
                GROUP BY DATE_TRUNC(${truncInterval}, ${users.createdAt})
                ORDER BY DATE_TRUNC(${truncInterval}, ${users.createdAt}) ASC
            `
        );

        // Drizzle returns the result directly as an array-like
        const rows = result as unknown as GrowthQueryRow[];

        return rows.map((row) => {
            const date = new Date(row.period);
            return {
                date: date.toISOString(),
                users: parseInt(row.count, 10),
                label: formatDateLabel(date, groupBy),
            };
        });
    } catch (error) {
        console.error("[Admin Queries] Error fetching user growth data:", error);
        return [];
    }
}

/**
 * Format date for chart axis labels based on grouping.
 */
function formatDateLabel(date: Date, groupBy: "day" | "week" | "month"): string {
    if (groupBy === "month") {
        return date.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
    }
    if (groupBy === "week") {
        return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    }
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

interface AccountTypeRow {
    account_type: string;
    count: string;
}

/**
 * Get user counts grouped by account type (for future pie chart).
 */
export async function getUsersByAccountType(): Promise<{ type: string; count: number }[]> {
    try {
        const result = await db.execute(
            sql`
                SELECT 
                    COALESCE(${users.accountType}, 'individual') as account_type,
                    COUNT(*)::text as count
                FROM ${users}
                GROUP BY COALESCE(${users.accountType}, 'individual')
            `
        );

        const rows = result as unknown as AccountTypeRow[];

        return rows.map((row) => ({
            type: row.account_type,
            count: parseInt(row.count, 10),
        }));
    } catch (error) {
        console.error("[Admin Queries] Error fetching users by type:", error);
        return [];
    }
}

/**
 * Get minimal user data for lists (optimized column selection).
 * Only fetches columns needed for display.
 */
export async function getRecentUsersOptimized(limit: number = 5) {
    try {
        return await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profileImageUrl: users.profileImageUrl,
                onboardingCompleted: users.onboardingCompleted,
                createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(limit);
    } catch (error) {
        console.error("[Admin Queries] Error fetching recent users:", error);
        return [];
    }
}
