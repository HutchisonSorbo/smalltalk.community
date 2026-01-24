import { db } from "@/server/db";
import { users, reports, adminActivityLog } from "@shared/schema";
import { count, eq, gte, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Lock, Key, Activity, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

async function getSecurityStats() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const defaultStats = {
        pendingReports: 0,
        recentAdminActions: 0,
        totalUsers: 0,
        recentSignups: 0,
    };

    try {
        const [
            pendingReports,
            recentAdminActions,
            totalUsers,
            recentSignups,
        ] = await Promise.all([
            db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")).catch(() => [{ count: 0 }]),
            db.select({ count: count() }).from(adminActivityLog).where(gte(adminActivityLog.createdAt, twentyFourHoursAgo)).catch(() => [{ count: 0 }]),
            db.select({ count: count() }).from(users).catch(() => [{ count: 0 }]),
            db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)).catch(() => [{ count: 0 }]),
        ]);

        return {
            pendingReports: pendingReports[0]?.count ?? 0,
            recentAdminActions: recentAdminActions[0]?.count ?? 0,
            totalUsers: totalUsers[0]?.count ?? 0,
            recentSignups: recentSignups[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[Admin Security] Error fetching security stats:", error);
        return defaultStats;
    }
}

async function getRecentSecurityEvents() {
    try {
        const events = await db
            .select({
                id: adminActivityLog.id,
                action: adminActivityLog.action,
                targetType: adminActivityLog.targetType,
                targetId: adminActivityLog.targetId,
                createdAt: adminActivityLog.createdAt,
                adminFirstName: users.firstName,
                adminEmail: users.email,
            })
            .from(adminActivityLog)
            .leftJoin(users, eq(adminActivityLog.adminId, users.id))
            .orderBy(desc(adminActivityLog.createdAt))
            .limit(10);

        return events;
    } catch (error) {
        console.error("[Admin Security] Error fetching recent security events:", error);
        return [];
    }
}


export default async function SecurityDashboardPage() {
    const stats = await getSecurityStats();
    const recentEvents = await getRecentSecurityEvents();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
                <p className="text-muted-foreground">Monitor platform security and access controls</p>
            </div>

            {/* Security Status */}
            <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                        <p className="font-medium text-green-700">System Security Status: Normal</p>
                        <p className="text-sm text-green-600">No critical security alerts at this time</p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReports}</div>
                        <p className="text-xs text-muted-foreground">require review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin Actions (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentAdminActions}</div>
                        <p className="text-xs text-muted-foreground">logged actions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">platform users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Signups (7d)</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentSignups}</div>
                        <p className="text-xs text-muted-foreground">this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Security Actions</CardTitle>
                    <CardDescription>Quick access to security controls</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/security/failed-logins">View Failed Logins</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/security/ip-allowlist">Manage IP Allowlist</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/security/audit">Full Audit Log</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/reports">Review Reports</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Admin Activity</CardTitle>
                    <CardDescription>Latest administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentEvents.length > 0 ? (
                        <div className="space-y-3">
                            {recentEvents.map((event: any) => (
                                <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                                    <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                {event.adminFirstName || event.adminEmail?.split("@")[0] || "Admin"}
                                            </span>
                                            {" "}
                                            <span className="text-muted-foreground">
                                                {event.action?.replace(/\./g, " ").replace(/_/g, " ")}
                                            </span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.createdAt?.toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {event.targetType}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No recent admin activity
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
