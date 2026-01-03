import { db } from "@/server/db";
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
    classifieds,
    professionalProfiles,
    marketplaceListings,
    announcements,
    adminActivityLog,
} from "@shared/schema";
import { count, eq, sql, gte, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Building2, AppWindow, Flag, UserCheck, TrendingUp, Clock, Activity, Music, CalendarDays, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Vercel Serverless function configuration - allow up to 60 seconds for complex queries
export const maxDuration = 60;


async function getPlatformStats() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            usersLast30Days,
            usersLast7Days,
            usersLast24Hours,
            onboardingCompleted,
            musicianCount,
            bandCount,
            gigCount,
            volunteerCount,
            orgCount,
            professionalCount,
            listingCount,
            appCount,
            pendingReports,
            onboardingResponses,
            activeAnnouncements,
        ] = await Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
            db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
            db.select({ count: count() }).from(users).where(gte(users.createdAt, twentyFourHoursAgo)),
            db.select({ count: count() }).from(users).where(eq(users.onboardingCompleted, true)),
            db.select({ count: count() }).from(musicianProfiles),
            db.select({ count: count() }).from(bands),
            db.select({ count: count() }).from(gigs),
            db.select({ count: count() }).from(volunteerProfiles),
            db.select({ count: count() }).from(organisations),
            db.select({ count: count() }).from(professionalProfiles),
            db.select({ count: count() }).from(marketplaceListings),
            db.select({ count: count() }).from(apps),
            db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
            db.select({ count: count() }).from(userOnboardingResponses),
            db.select({ count: count() }).from(announcements).where(eq(announcements.isActive, true)),
        ]);

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
            musicians: musicianCount[0]?.count ?? 0,
            bands: bandCount[0]?.count ?? 0,
            gigs: gigCount[0]?.count ?? 0,
            volunteers: volunteerCount[0]?.count ?? 0,
            organisations: orgCount[0]?.count ?? 0,
            professionals: professionalCount[0]?.count ?? 0,
            listings: listingCount[0]?.count ?? 0,
            apps: appCount[0]?.count ?? 0,
            pendingReports: pendingReports[0]?.count ?? 0,
            onboardingResponses: onboardingResponses[0]?.count ?? 0,
            activeAnnouncements: activeAnnouncements[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[Admin Dashboard] Error fetching stats:", error);
        // Return default values so page still renders
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
        };
    }
}

async function getRecentActivity() {
    try {
        const logs = await db
            .select({
                id: adminActivityLog.id,
                action: adminActivityLog.action,
                targetType: adminActivityLog.targetType,
                targetId: adminActivityLog.targetId,
                createdAt: adminActivityLog.createdAt,
                adminFirstName: users.firstName,
                adminLastName: users.lastName,
                adminEmail: users.email,
                adminImage: users.profileImageUrl,
            })
            .from(adminActivityLog)
            .leftJoin(users, eq(adminActivityLog.adminId, users.id))
            .orderBy(desc(adminActivityLog.createdAt))
            .limit(5);

        return logs;
    } catch (error) {
        console.error("[Admin Dashboard] Error fetching activity:", error);
        return [];
    }
}

async function getRecentUsers() {
    try {
        const recentUsers = await db
            .select()
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(5);
        return recentUsers;
    } catch (error) {
        console.error("[Admin Dashboard] Error fetching users:", error);
        return [];
    }
}

function formatAction(action: string): string {
    const parts = action.split(".");
    if (parts.length === 2) {
        return `${parts[1].replace(/_/g, " ")} ${parts[0]}`;
    }
    return action.replace(/_/g, " ");
}

export default async function PlatformAdminDashboard() {
    const stats = await getPlatformStats();
    const recentActivity = await getRecentActivity();
    const recentUsers = await getRecentUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
                <p className="text-muted-foreground">Overview of smalltalk.community metrics and activity</p>
            </div>

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

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Admin Activity
                        </CardTitle>
                        <CardDescription>Latest actions by administrators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={log.adminImage || undefined} />
                                            <AvatarFallback>
                                                {(log.adminFirstName?.[0] || log.adminEmail?.[0] || "A").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-medium">
                                                    {log.adminFirstName || log.adminEmail?.split("@")[0] || "Admin"}
                                                </span>
                                                {" "}
                                                <span className="text-muted-foreground capitalize">
                                                    {formatAction(log.action)}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.createdAt?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/activity">View All Activity</Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No admin activity recorded yet
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Recent Signups
                        </CardTitle>
                        <CardDescription>Newest platform members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.profileImageUrl || undefined} />
                                        <AvatarFallback>
                                            {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {user.accountType || "Individual"}
                                    </Badge>
                                </div>
                            ))}
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/users">View All Users</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/users">Manage Users</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/reports">Review Reports</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/announcements">Announcements</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/apps">Manage Apps</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/content">Content Overview</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/settings">Site Settings</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/export">Export Data</Link>
                    </Button>
                </CardContent>
            </Card>

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
