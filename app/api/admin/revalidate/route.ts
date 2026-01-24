import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * POST /api/admin/revalidate - Force revalidate admin caches
 * 
 * Admin-only endpoint to clear stale cached data, such as when:
 * - Cached errors persist after fixes
 * - Data appears outdated after deployments
 * - Need to force-refresh dashboard statistics
 */
export async function POST() {
    try {
        // Require admin authentication
        const adminCheck = await requireAdmin();
        if (!adminCheck) {
            return NextResponse.json(
                { message: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        // Revalidate all admin caches
        const revalidatedTags = [
            CACHE_TAGS.ADMIN_DASHBOARD_STATS,
            CACHE_TAGS.ADMIN_RECENT_ACTIVITY,
            CACHE_TAGS.ADMIN_RECENT_USERS,
            CACHE_TAGS.ADMIN_USER_GROWTH,
        ];

        for (const tag of revalidatedTags) {
            revalidateTag(tag, {});
        }

        console.log("[Admin Revalidate] Cleared cache tags:", revalidatedTags);

        return NextResponse.json({
            message: "Admin caches cleared successfully",
            clearedTags: revalidatedTags,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Admin Revalidate] Error:", error);
        return NextResponse.json(
            { message: "Failed to revalidate caches" },
            { status: 500 }
        );
    }
}
