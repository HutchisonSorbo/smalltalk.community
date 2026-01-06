import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db";
import { apps } from "@shared/schema";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * CORS configuration
 * - Production: MUST have NEXT_PUBLIC_APP_URL set (fail fast if missing)
 * - Development: Allow "*" as fallback for local testing
 */
function getCorsOrigin(): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const isProduction = process.env.NODE_ENV === "production";

    if (appUrl) {
        return appUrl;
    }

    if (isProduction) {
        throw new Error(
            "[CORS] NEXT_PUBLIC_APP_URL must be set in production. " +
            "Refusing to use wildcard '*' origin in production environment."
        );
    }

    // Development only: allow wildcard for local testing
    return "*";
}

const CORS_ORIGIN = getCorsOrigin();
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

/**
 * CORS preflight handler
 */
export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * GET /api/apps - Public app catalog endpoint
 * 
 * Intentionally public: catalog endpoint (no auth required) — documented exception to API auth guideline.
 * Apps catalog is public data that unauthenticated users need to see available apps.
 */
export async function GET() {
    try {
        const allApps = await getCachedApps();
        return NextResponse.json(allApps, { headers: CORS_HEADERS });
    } catch (error) {
        // Log full error server-side for debugging
        console.error("[API /apps] Error fetching apps:", error);
        // Return sanitized error to client - never leak internal details
        return NextResponse.json({
            message: "Failed to fetch apps. Please try again later."
        }, { status: 500, headers: CORS_HEADERS });
    }
}
