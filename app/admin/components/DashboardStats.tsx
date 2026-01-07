
import { db } from "@/server/db";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
    users,
    musicianProfiles,
    bands,
    volunteerProfiles,
    organisations,
    apps,
    reports,
    userOnboardingResponses,
    gigs,
    professionalProfiles,
    marketplaceListings,
    announcements,
} from "@shared/schema";
import { count, eq, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Building2, AppWindow, Flag, UserCheck, TrendingUp, Clock, Music, CalendarDays, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Optimized platform stats fetcher.
 * Uses sequential batches to avoid overwhelming the connection pool.
 * Each batch runs its queries in parallel, but batches run sequentially.
 */
const getPlatformStats = unstable_cache(
    async () => {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Batch 1: Core user stats (run in parallel - these are important)
            const [totalUsers, usersLast30Days, onboardingCompleted] = await Promise.all([
                db.select({ count: count() }).from(users),
                db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
                db.select({ count: count() }).from(users).where(eq(users.onboardingCompleted, true)),
            ]);

            // Batch 2: Secondary user stats + apps (run after batch 1)
            const [usersLast7Days, usersLast24Hours, appCount, pendingReports] = await Promise.all([
                db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
                db.select({ count: count() }).from(users).where(gte(users.createdAt, twentyFourHoursAgo)),
                db.select({ count: count() }).from(apps),
                db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
            ]);

            // Batch 3: Content stats (less critical, can be estimated as 0 if slow)
            let contentStats = {
                musicians: 0,
                bands: 0,
                gigs: 0,
                volunteers: 0,
                organisations: 0,
                professionals: 0,
                listings: 0,
                onboardingResponses: 0,
                activeAnnouncements: 0,
            };

            try {
                const [
                    musicianCount,
                    bandCount,
                    gigCount,
                    volunteerCount,
                    orgCount,
                ] = await Promise.all([
                    db.select({ count: count() }).from(musicianProfiles),
                    db.select({ count: count() }).from(bands),
                    db.select({ count: count() }).from(gigs),
                    db.select({ count: count() }).from(volunteerProfiles),
                    db.select({ count: count() }).from(organisations),
                ]);

                contentStats.musicians = musicianCount[0]?.count ?? 0;
                contentStats.bands = bandCount[0]?.count ?? 0;
                contentStats.gigs = gigCount[0]?.count ?? 0;
                contentStats.volunteers = volunteerCount[0]?.count ?? 0;
                contentStats.organisations = orgCount[0]?.count ?? 0;
            } catch (e) {
                console.warn("[Admin Dashboard] Content stats batch failed, using defaults:", e);
            }

            // Batch 4: Remaining stats (optional - if this fails, use defaults)
            try {
                const [
                    professionalCount,
                    listingCount,
                    onboardingResponses,
                    activeAnnouncements,
                ] = await Promise.all([
                    db.select({ count: count() }).from(professionalProfiles),
                    db.select({ count: count() }).from(marketplaceListings),
                    db.select({ count: count() }).from(userOnboardingResponses),
                    db.select({ count: count() }).from(announcements).where(eq(announcements.isActive, true)),
                ]);

                contentStats.professionals = professionalCount[0]?.count ?? 0;
                contentStats.listings = listingCount[0]?.count ?? 0;
                contentStats.onboardingResponses = onboardingResponses[0]?.count ?? 0;
                contentStats.activeAnnouncements = activeAnnouncements[0]?.count ?? 0;
            } catch (e) {
                console.warn("[Admin Dashboard] Optional stats batch failed, using defaults:", e);
            }

            const totalUsersCount = totalUsers[0]?.count ?? 0;
            const onboardingCompletedCount = onboardingCompleted[0]?.count ?? 0;
            const onboardingRate = totalUsersCount > 0
                ? Math.round((onboardingCompletedCount / totalUsersCount) * 100)
                : 0;

            return {
                totalUsers: totalUsersCount,
                usersLast30Days: usersLast30Days[0]?.count ?? 0,
                usersLast7Days: usersLast7Days[0]?.count ?? 0,
                usersLast24Hours: usersLast24Hours[0]?.count ?? 0,
                onboardingCompleted: onboardingCompletedCount,
                onboardingRate,
                apps: appCount[0]?.count ?? 0,
                pendingReports: pendingReports[0]?.count ?? 0,
                ...contentStats,
            };
        } catch (error) {
            console.error("[Admin Dashboard] Error fetching stats:", error);
            // Return safe defaults with error property so UI can surface the issue
            return {
                totalUsers: 0,
                usersLast30Days: 0,
                usersLast7Days: 0,
                usersLast24Hours: 0,
                onboardingCompleted: 0,
                onboardingRate: 0,
                musicians: 0,
                bands: 0,
                gigs: 0,
                volunteers: 0,
                organisations: 0,
                professionals: 0,
                listings: 0,
                apps: 0,
                pendingReports: 0,
                onboardingResponses: 0,
                activeAnnouncements: 0,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
    [CACHE_TAGS.ADMIN_DASHBOARD_STATS],
    { revalidate: 3600 } // Cache for 1 hour (admin stats don't need real-time updates)
);

export async function DashboardStats() {
    const stats = await getPlatformStats();

    return (
        <div className="space-y-4">
            {/* Error Alert - Surface stats fetch failures to admins */}
            {"error" in stats && stats.error && (
                <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="flex items-center gap-3 py-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-red-700">
                                Failed to load dashboard statistics
                            </p>
                            <p className="text-sm text-red-600">
                                {stats.error}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alert Cards */}
            {stats.pendingReports > 0 && (
                <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-700">
                                    {stats.pendingReports} pending {stats.pendingReports === 1 ? "report" : "reports"} require review
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-500/20">
                            <Link href="/admin/reports">Review Now</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.usersLast24Hours} today • +{stats.usersLast7Days} this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onboardingRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.onboardingCompleted.toLocaleString()} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.usersLast30Days}</div>
                        <p className="text-xs text-muted-foreground">
                            new users in 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReports}</div>
                        <p className="text-xs text-muted-foreground">
                            require review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Musicians</CardTitle>
                        <Music className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.musicians}</div>
                        <p className="text-xs text-muted-foreground">profiles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bands</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bands}</div>
                        <p className="text-xs text-muted-foreground">registered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gigs</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.gigs}</div>
                        <p className="text-xs text-muted-foreground">events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.volunteers}</div>
                        <p className="text-xs text-muted-foreground">profiles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Organisations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.organisations}</div>
                        <p className="text-sm text-muted-foreground">registered organisations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AppWindow className="h-5 w-5" />
                            Platform Apps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.apps}</div>
                        <p className="text-sm text-muted-foreground">in the ecosystem</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Onboarding Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.onboardingResponses}</div>
                        <p className="text-sm text-muted-foreground">responses collected</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
