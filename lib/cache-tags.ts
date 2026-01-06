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
    // ==========================================
    // Admin Dashboard Tags
    // ==========================================
    /** Admin dashboard statistics - users, reports, announcements counts */
    ADMIN_DASHBOARD_STATS: "admin-dashboard-stats",

    /** Recent admin activity log entries */
    ADMIN_RECENT_ACTIVITY: "admin-recent-activity",

    /** Recent users list on admin dashboard */
    ADMIN_RECENT_USERS: "admin-recent-users",

    /** User growth trend data for charts */
    ADMIN_USER_GROWTH: "admin-user-growth",

    // ==========================================
    // App Marketplace Tags
    // ==========================================
    /** All apps in the catalog - invalidate when apps are added/updated/removed */
    APPS_CATALOG: "apps-catalog",

    /** User's installed apps - invalidate per-user when user adds/removes apps */
    USER_APPS: "user-apps",

    /** App recommendations for onboarding - invalidate when recommendation logic changes */
    APP_RECOMMENDATIONS: "app-recommendations",

    // ==========================================
    // Hub/Feature Tags
    // ==========================================
    /** Volunteer opportunities listing */
    VOLUNTEER_OPPORTUNITIES: "volunteer-opportunities",

    /** Musician profiles for Local Music Network */
    MUSICIAN_PROFILES: "musician-profiles",

    /** Professional profiles listing */
    PROFESSIONAL_PROFILES: "professional-profiles",

    /** Gigs listing */
    GIGS_LISTING: "gigs-listing",

    /** Announcements feed */
    ANNOUNCEMENTS: "announcements",
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

