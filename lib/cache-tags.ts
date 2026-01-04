/**
 * Centralized cache tag constants for Next.js cache invalidation.
 * 
 * Use these constants with:
 * - `unstable_cache(..., [CACHE_TAGS.TAG_NAME], ...)` for caching
 * - `revalidateTag(CACHE_TAGS.TAG_NAME)` for invalidation
 * 
 * This ensures cache producers and consumers stay in sync.
 */
export const CACHE_TAGS = {
    /** Admin dashboard statistics - users, reports, announcements counts */
    ADMIN_DASHBOARD_STATS: "admin-dashboard-stats",

    /** Recent admin activity log entries */
    ADMIN_RECENT_ACTIVITY: "admin-recent-activity",

    /** Recent users list on admin dashboard */
    ADMIN_RECENT_USERS: "admin-recent-users",
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];
