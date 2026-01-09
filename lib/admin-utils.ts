import { db } from "@/server/db";
import { adminActivityLog, users } from "@shared/schema";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase-server";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Admin action types for consistent logging
 */
export const AdminActions = {
    // User actions
    USER_VIEW: "user.view",
    USER_CREATE: "user.create",
    USER_UPDATE: "user.update",
    USER_SUSPEND: "user.suspend",
    USER_UNSUSPEND: "user.unsuspend",
    USER_BULK_UNSUSPEND: "user.bulk_unsuspend",
    USER_DELETE: "user.delete",
    USER_BULK_DELETE: "user.bulk_delete",
    USER_MAKE_ADMIN: "user.make_admin",
    USER_REMOVE_ADMIN: "user.remove_admin",

    // Role actions
    ROLE_CREATE: "role.create",
    ROLE_UPDATE: "role.update",
    ROLE_DELETE: "role.delete",
    ROLE_ASSIGN: "role.assign",
    ROLE_UNASSIGN: "role.unassign",

    // Content actions
    CONTENT_DELETE: "content.delete",
    CONTENT_HIDE: "content.hide",
    CONTENT_RESTORE: "content.restore",

    // Report actions
    REPORT_REVIEW: "report.review",
    REPORT_RESOLVE: "report.resolve",
    REPORT_DISMISS: "report.dismiss",

    // App actions
    APP_CREATE: "app.create",
    APP_UPDATE: "app.update",
    APP_DELETE: "app.delete",
    APP_TOGGLE_ACTIVE: "app.toggle_active",
    APP_TOGGLE_BETA: "app.toggle_beta",

    // Announcement actions
    ANNOUNCEMENT_CREATE: "announcement.create",
    ANNOUNCEMENT_UPDATE: "announcement.update",
    ANNOUNCEMENT_DELETE: "announcement.delete",

    // Settings actions
    SETTING_UPDATE: "setting.update",
    FEATURE_FLAG_UPDATE: "feature_flag.update",

    // Export actions
    EXPORT_DATA: "export.data",

    // Test actions
    TEST_DATA_CREATE: "test.data_create",

    // Auth actions
    ADMIN_AUTH_FAIL: "admin.auth_fail",
} as const;

export type AdminAction = typeof AdminActions[keyof typeof AdminActions];

/**
 * Target types for activity log
 */
export const TargetTypes = {
    USER: "user",
    ROLE: "role",
    APP: "app",
    REPORT: "report",
    ANNOUNCEMENT: "announcement",
    MUSICIAN: "musician",
    BAND: "band",
    GIG: "gig",
    LISTING: "listing",
    ORGANISATION: "organisation",
    VOLUNTEER: "volunteer",
    PROFESSIONAL: "professional",
    SETTING: "setting",
    FEATURE_FLAG: "feature_flag",
} as const;

export type TargetType = typeof TargetTypes[keyof typeof TargetTypes];

/**
 * Log an admin action to the activity log.
 * This function should be called after any admin action that modifies data.
 * 
 * SECURITY: Activity logs are immutable - only insert operations are allowed.
 * The table is protected by service_role-only RLS policies.
 */
export async function logAdminAction({
    adminId,
    action,
    targetType,
    targetId,
    details,
}: {
    adminId: string;
    action: AdminAction | string;
    targetType: TargetType | string;
    targetId: string;
    details?: Record<string, unknown>;
}) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || "unknown";
        const userAgent = headersList.get("user-agent") || undefined;

        await db.insert(adminActivityLog).values({
            adminId,
            action,
            targetType,
            targetId,
            details: details ?? null,
            ipAddress,
            userAgent,
        });

        // Revalidate admin caches so the dashboard updates immediately
        revalidateTag(CACHE_TAGS.ADMIN_RECENT_ACTIVITY);
        revalidateTag(CACHE_TAGS.ADMIN_DASHBOARD_STATS);
        revalidateTag(CACHE_TAGS.ADMIN_RECENT_USERS);
    } catch (error) {
        // Log to console but don't throw - activity logging shouldn't break admin operations
        console.error("[Admin Activity Log] Failed to log action:", error);
    }
}

/**
 * Zod schema for bulk user operations.
 * Validates userIds as a non-empty array of strings (UUIDs).
 */
export const BulkUserIdsSchema = z.object({
    userIds: z.array(z.string().uuid()).min(1, "At least one user ID is required"),
});

/**
 * Zod schema for bulk export operations.
 * Includes optional format parameter.
 */
export const BulkExportSchema = z.object({
    userIds: z.array(z.string().uuid()).min(1, "At least one user ID is required"),
    format: z.enum(["csv", "json"]).optional().default("csv"),
});

/**
 * Result of admin verification.
 */
export interface VerifyAdminResult {
    authorized: boolean;
    adminId: string | null;
}

/**
 * Verify that the current request is from an authenticated admin user.
 * 
 * SECURITY: This function checks:
 * 1. User is authenticated via Supabase
 * 2. User exists in the database
 * 3. User has the isAdmin flag set to true
 * 
 * @returns Object with authorized status and adminId (if authorized)
 */
export async function verifyAdminRequest(): Promise<VerifyAdminResult> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { authorized: false, adminId: null };
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser || !dbUser.isAdmin || dbUser.isSuspended) {
            return { authorized: false, adminId: null };
        }

        return { authorized: true, adminId: user.id };
    } catch (error) {
        console.error("[Admin API] Auth verification error:", error);

        // SECURITY: Log authentication failures to the activity log for monitoring
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            await logAdminAction({
                adminId: user?.id || "unauthenticated",
                action: AdminActions.ADMIN_AUTH_FAIL,
                targetType: TargetTypes.USER,
                targetId: user?.id || "unknown",
                details: {
                    error: error instanceof Error ? error.message : "Internal auth verification failure",
                    stack: error instanceof Error ? error.stack : undefined,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (logError) {
            console.error("[Admin API] Failed to log auth verification error:", logError);
        }

        return { authorized: false, adminId: null };
    }
}
