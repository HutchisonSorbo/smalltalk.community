import { db } from "@/server/db";
import {
    users,
    musicianProfiles,
    bands,
    gigs,
    classifieds,
    volunteerProfiles,
    organisations,
    apps,
    reports,
    userApps,
    userOnboardingResponses,
} from "@shared/schema";
import { count, eq, gte, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Users,
    AppWindow,
    Activity,
    Calendar,
    BarChart3,
} from "lucide-react";

async function getMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User growth over time periods
    const [
        totalUsers,
        usersLast30Days,
        usersLast7Days,
        usersToday,
        completedOnboarding,
        totalMusicians,
        totalBands,
        totalGigs,
        totalVolunteers,
        totalOrgs,
        totalApps,
        appInstalls,
        onboardingResponses,
        pendingReports,
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, yesterday)),
        db.select({ count: count() }).from(users).where(eq(users.onboardingCompleted, true)),
        db.select({ count: count() }).from(musicianProfiles),
        db.select({ count: count() }).from(bands),
        db.select({ count: count() }).from(gigs),
        db.select({ count: count() }).from(volunteerProfiles),
        db.select({ count: count() }).from(organisations),
        db.select({ count: count() }).from(apps),
        db.select({ count: count() }).from(userApps),
        db.select({ count: count() }).from(userOnboardingResponses),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
    ]);

    return {
        users: {
            total: totalUsers[0]?.count ?? 0,
            last30Days: usersLast30Days[0]?.count ?? 0,
            last7Days: usersLast7Days[0]?.count ?? 0,
            today: usersToday[0]?.count ?? 0,
        },
        onboarding: {
            completed: completedOnboarding[0]?.count ?? 0,
            responses: onboardingResponses[0]?.count ?? 0,
        },
        content: {
            musicians: totalMusicians[0]?.count ?? 0,
            bands: totalBands[0]?.count ?? 0,
            gigs: totalGigs[0]?.count ?? 0,
            volunteers: totalVolunteers[0]?.count ?? 0,
            organisations: totalOrgs[0]?.count ?? 0,
        },
        apps: {
            total: totalApps[0]?.count ?? 0,
            installs: appInstalls[0]?.count ?? 0,
        },
        reports: {
            pending: pendingReports[0]?.count ?? 0,
        },
    };
}

async function getAppUsageStats() {
    const appUsage = await db
        .select({
            appId: userApps.appId,
            appName: apps.name,
            installs: count(),
        })
        .from(userApps)
        .innerJoin(apps, eq(userApps.appId, apps.id))
        .groupBy(userApps.appId, apps.name)
        .orderBy(desc(count()));

    return appUsage;
}

export default async function MetricsPage() {
    const metrics = await getMetrics();
    const appUsage = await getAppUsageStats();

    const onboardingRate = metrics.users.total > 0
        ? Math.round((metrics.onboarding.completed / metrics.users.total) * 100)
        : 0;

    const avgAppsPerUser = metrics.users.total > 0
        ? (metrics.apps.installs / metrics.users.total).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Metrics & Analytics</h1>
                <p className="text-muted-foreground">Platform performance and usage statistics</p>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.users.total.toLocaleString()}</div>
                        <p className="text-xs text-green-600">
                            +{metrics.users.today} today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{onboardingRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.onboarding.completed} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">App Installs</CardTitle>
                        <AppWindow className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.apps.installs.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            ~{avgAppsPerUser} per user
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.reports.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            require review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* User Growth */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        User Growth Summary
                    </CardTitle>
                    <CardDescription>Registration trends over different time periods</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 rounded-lg border bg-card">
                            <p className="text-sm text-muted-foreground">Today</p>
                            <p className="text-2xl font-bold text-green-600">+{metrics.users.today}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <p className="text-sm text-muted-foreground">Last 7 Days</p>
                            <p className="text-2xl font-bold text-blue-600">+{metrics.users.last7Days}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <p className="text-sm text-muted-foreground">Last 30 Days</p>
                            <p className="text-2xl font-bold text-purple-600">+{metrics.users.last30Days}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <p className="text-sm text-muted-foreground">All Time</p>
                            <p className="text-2xl font-bold">{metrics.users.total.toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Content Breakdown
                    </CardTitle>
                    <CardDescription>Content distribution by type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-3xl font-bold text-purple-600">{metrics.content.musicians}</p>
                            <p className="text-sm text-muted-foreground">Musicians</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-3xl font-bold text-purple-600">{metrics.content.bands}</p>
                            <p className="text-sm text-muted-foreground">Bands</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-3xl font-bold text-purple-600">{metrics.content.gigs}</p>
                            <p className="text-sm text-muted-foreground">Gigs</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-3xl font-bold text-red-600">{metrics.content.volunteers}</p>
                            <p className="text-sm text-muted-foreground">Volunteers</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-3xl font-bold text-red-600">{metrics.content.organisations}</p>
                            <p className="text-sm text-muted-foreground">Organisations</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* App Usage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AppWindow className="h-5 w-5" />
                        App Usage
                    </CardTitle>
                    <CardDescription>Most popular apps by installs</CardDescription>
                </CardHeader>
                <CardContent>
                    {appUsage.length > 0 ? (
                        <div className="space-y-3">
                            {appUsage.map((app, index) => {
                                const maxInstalls = appUsage[0]?.installs || 1;
                                const percentage = (app.installs / maxInstalls) * 100;

                                return (
                                    <div key={app.appId} className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-6">{index + 1}.</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{app.appName}</span>
                                                <Badge variant="outline">{app.installs} installs</Badge>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No app usage data yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
