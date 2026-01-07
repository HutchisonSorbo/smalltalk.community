/**
 * Centralized admin database queries with optimized column selection.
 * 
 * These functions implement best practices:
 * - Prefer Drizzle query builder; uses parameterized sql template literals where needed
 * - Select only needed columns (no SELECT *)
 * - Proper error handling with safe defaults
 * - Cache-friendly data shapes
 * 
 * Note: sql`` template literals are used in a Drizzle-safe, parameterized manner
 * for PostgreSQL-specific functions like DATE_TRUNC and COALESCE that don't have
 * direct Drizzle equivalents.
 */

import { db } from "@/server/db";
import { users } from "@shared/schema";
import { sql, desc, gte, lte, count, and } from "drizzle-orm";
import { DEFAULT_LOCALE } from "@/lib/config";

export interface UserGrowthDataPoint {
    date: string;
    users: number;
    label: string;
}

/**
 * Get user growth data grouped by day/week/month for chart visualization.
 * Uses Drizzle query builder with sql template literals only for date truncation.
 * 
 * @param startDate Start of the date range
 * @param endDate End of the date range  
 * @param groupBy How to group the data ('day' | 'week' | 'month')
 * @param locale Locale for date formatting (defaults to DEFAULT_LOCALE)
 */
export async function getUserGrowthData(
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day",
    locale: string = DEFAULT_LOCALE
): Promise<UserGrowthDataPoint[]> {
    try {
        // Use the same DATE_TRUNC expression for SELECT, GROUP BY, and ORDER BY
        // PostgreSQL requires exact expression matching when using aggregate functions
        const dateTruncExpr = sql<Date>`DATE_TRUNC(${sql.raw(`'${groupBy}'`)}, ${users.createdAt})`;

        const result = await db
            .select({
                period: dateTruncExpr,
                count: count(),
            })
            .from(users)
            .where(
                and(
                    gte(users.createdAt, startDate),
                    lte(users.createdAt, endDate)
                )
            )
            .groupBy(dateTruncExpr)
            .orderBy(dateTruncExpr);

        return result.map((row) => {
            const date = new Date(row.period);
            return {
                date: date.toISOString(),
                users: row.count,
                label: formatDateLabel(date, groupBy, locale),
            };
        });
    } catch (error) {
        console.error("[Admin Queries] Error fetching user growth data:", error);
        return [];
    }
}

/**
 * Format date for chart axis labels based on grouping.
 * @param date The date to format
 * @param groupBy The grouping interval
 * @param locale The locale to use for formatting (defaults to DEFAULT_LOCALE)
 */
function formatDateLabel(
    date: Date,
    groupBy: "day" | "week" | "month",
    locale: string = DEFAULT_LOCALE
): string {
    if (groupBy === "month") {
        return date.toLocaleDateString(locale, { month: "short", year: "2-digit" });
    }
    if (groupBy === "week") {
        return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
    }
    return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/**
 * Get user counts grouped by account type (for future pie chart).
 * Uses Drizzle query builder with sql template literal for COALESCE.
 */
export async function getUsersByAccountType(): Promise<{ type: string; count: number }[]> {
    try {
        const accountTypeExpr = sql<string>`COALESCE(${users.accountType}, 'individual')`;

        const result = await db
            .select({
                accountType: accountTypeExpr,
                count: count(),
            })
            .from(users)
            .groupBy(accountTypeExpr);

        return result.map((row) => ({
            type: row.accountType,
            count: row.count,
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
