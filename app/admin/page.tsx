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
} from "@shared/schema";
import { count, eq, sql, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Building2, AppWindow, Flag, UserCheck, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getPlatformStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
        totalUsers,
        usersLast30Days,
        usersLast7Days,
        onboardingCompleted,
        musicianCount,
        bandCount,
        volunteerCount,
        orgCount,
        appCount,
        pendingReports,
        onboardingResponses,
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
        db.select({ count: count() }).from(users).where(eq(users.onboardingCompleted, true)),
        db.select({ count: count() }).from(musicianProfiles),
        db.select({ count: count() }).from(bands),
        db.select({ count: count() }).from(volunteerProfiles),
        db.select({ count: count() }).from(organisations),
        db.select({ count: count() }).from(apps),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
        db.select({ count: count() }).from(userOnboardingResponses),
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
        onboardingCompleted: onboardingCompletedCount,
        onboardingRate,
        musicians: musicianCount[0]?.count ?? 0,
        bands: bandCount[0]?.count ?? 0,
        volunteers: volunteerCount[0]?.count ?? 0,
        organisations: orgCount[0]?.count ?? 0,
        apps: appCount[0]?.count ?? 0,
        pendingReports: pendingReports[0]?.count ?? 0,
        onboardingResponses: onboardingResponses[0]?.count ?? 0,
    };
}

export default async function PlatformAdminDashboard() {
    const stats = await getPlatformStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
                <p className="text-muted-foreground">Overview of smalltalk.community metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.usersLast7Days} last 7 days
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
                            {stats.onboardingCompleted} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.usersLast30Days}</div>
                        <p className="text-xs text-muted-foreground">
                            signups in 30 days
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

            {/* Profile Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Musicians</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.musicians}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bands</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bands}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.volunteers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organisations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.organisations}</div>
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
                        <Link href="/admin/onboarding">View Onboarding Data</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/reports">Review Reports</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/apps">Manage Apps</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Data Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Onboarding Responses
                        </CardTitle>
                        <CardDescription>User responses collected during onboarding</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">{stats.onboardingResponses}</div>
                        <Button asChild>
                            <Link href="/admin/onboarding">View & Export Data</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AppWindow className="h-5 w-5" />
                            Platform Apps
                        </CardTitle>
                        <CardDescription>Applications in the ecosystem</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">{stats.apps}</div>
                        <Button asChild variant="outline">
                            <Link href="/admin/apps">Manage Apps</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
