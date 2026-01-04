import { db } from "@/server/db";
import { adminActivityLog } from "@shared/schema";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Admin action types for consistent logging
 */
export const AdminActions = {
    // User actions
    USER_VIEW: "user.view",
    USER_UPDATE: "user.update",
    USER_SUSPEND: "user.suspend",
    USER_UNSUSPEND: "user.unsuspend",
    USER_DELETE: "user.delete",
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
