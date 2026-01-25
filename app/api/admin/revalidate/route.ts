import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const revalidateSchema = z.object({
    tags: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/revalidate - Force revalidate admin caches
 * 
 * Admin-only endpoint to clear stale cached data, such as when:
 * - Cached errors persist after fixes
 * - Data appears outdated after deployments
 * - Need to force-refresh dashboard statistics
 */
export async function POST(req: NextRequest) {
    try {
        // Require admin authentication
        const adminCheck = await requireAdmin();
        if (!adminCheck) {
            return NextResponse.json(
                { message: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        let tagsToRevalidate: string[] = [
            CACHE_TAGS.ADMIN_DASHBOARD_STATS,
            CACHE_TAGS.ADMIN_RECENT_ACTIVITY,
            CACHE_TAGS.ADMIN_RECENT_USERS,
            CACHE_TAGS.ADMIN_USER_GROWTH,
        ];

        // Optional: Allow passing specific tags via body
        try {
            const body = await req.json();
            const result = revalidateSchema.safeParse(body);
            if (result.success && result.data.tags) {
                // Validate tags against allowlist
                const allowedTags = Object.values(CACHE_TAGS);
                const requestedTags = result.data.tags;
                const invalidTags = requestedTags.filter(tag => !allowedTags.includes(tag as any));

                if (invalidTags.length > 0) {
                    return NextResponse.json(
                        { message: "Invalid cache tags provided", invalidTags },
                        { status: 400 }
                    );
                }
                tagsToRevalidate = requestedTags;
            }
        } catch {
            // Ignore JSON parse errors, just use defaults
        }

        for (const tag of tagsToRevalidate) {
            revalidateTag(tag, {});
        }

        console.log("[Admin Revalidate] Cleared cache tags:", tagsToRevalidate);

        return NextResponse.json({
            message: "Admin caches cleared successfully",
            clearedTags: tagsToRevalidate,
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
