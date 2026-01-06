import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db";
import { apps } from "@shared/schema";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

// Cache apps catalog for 5 minutes - apps change infrequently
export const revalidate = 300;

/**
 * Cached query for active apps.
 * Per Slack/Zapier patterns, app catalogs are heavily cached since they change infrequently.
 */
const getCachedApps = unstable_cache(
    async () => {
        return await db
            .select({
                id: apps.id,
                name: apps.name,
                description: apps.description,
                iconUrl: apps.iconUrl,
                route: apps.route,
                category: apps.category,
                isBeta: apps.isBeta,
                isActive: apps.isActive,
            })
            .from(apps)
            .where(eq(apps.isActive, true));
    },
    [CACHE_TAGS.APPS_CATALOG],
    { revalidate: 300, tags: [CACHE_TAGS.APPS_CATALOG] }
);

export async function GET() {
    try {
        const allApps = await getCachedApps();
        return NextResponse.json(allApps);
    } catch (error) {
        // Log full error server-side for debugging
        console.error("[API /apps] Error fetching apps:", error);
        // Return sanitized error to client - never leak internal details
        return NextResponse.json({
            message: "Failed to fetch apps. Please try again later."
        }, { status: 500 });
    }
}
