import { db } from "@/server/db";
import { adminActivityLog, users } from "@shared/schema";
import { desc, eq, and, gte, like, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Activity, User, Shield, Flag, Megaphone, AppWindow, Settings } from "lucide-react";

// Action category icons
const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    user: User,
    role: Shield,
    report: Flag,
    announcement: Megaphone,
    app: AppWindow,
    setting: Settings,
    feature_flag: Settings,
};

function getActionIcon(action: string) {
    const category = action.split(".")[0];
    return actionIcons[category] || Activity;
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
    if (action.includes("delete") || action.includes("suspend") || action.includes("remove")) {
        return "destructive";
    }
    if (action.includes("create") || action.includes("make_admin")) {
        return "default";
    }
    return "secondary";
}

function formatAction(action: string): string {
    return action.split(".").map(part =>
        part.split("_").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ")
    ).join(" → ");
}

interface SearchParams {
    page?: string;
    action?: string;
    admin?: string;
}

async function getActivityLogs(searchParams: SearchParams) {
    try {
        const page = parseInt(searchParams.page || "1", 10);
        const pageSize = 50;
        const offset = (page - 1) * pageSize;

        const logs = await db
            .select({
                id: adminActivityLog.id,
                action: adminActivityLog.action,
                targetType: adminActivityLog.targetType,
                targetId: adminActivityLog.targetId,
                details: adminActivityLog.details,
                ipAddress: adminActivityLog.ipAddress,
                createdAt: adminActivityLog.createdAt,
                adminId: adminActivityLog.adminId,
                adminFirstName: users.firstName,
                adminLastName: users.lastName,
                adminEmail: users.email,
                adminImage: users.profileImageUrl,
            })
            .from(adminActivityLog)
            .leftJoin(users, eq(adminActivityLog.adminId, users.id))
            .orderBy(desc(adminActivityLog.createdAt))
            .limit(pageSize)
            .offset(offset);

        return logs;
    } catch (error) {
        console.error("[Admin Activity] Error fetching logs:", error);
        return [];
    }
}

async function getActivityStats() {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [totalLogs, logsToday, logsThisWeek] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(adminActivityLog),
            db.select({ count: sql<number>`count(*)` }).from(adminActivityLog)
                .where(gte(adminActivityLog.createdAt, twentyFourHoursAgo)),
            db.select({ count: sql<number>`count(*)` }).from(adminActivityLog)
                .where(gte(adminActivityLog.createdAt, sevenDaysAgo)),
        ]);

        return {
            total: totalLogs[0]?.count ?? 0,
            today: logsToday[0]?.count ?? 0,
            thisWeek: logsThisWeek[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[Admin Activity] Error fetching stats:", error);
        return { total: 0, today: 0, thisWeek: 0 };
    }
}

export default async function ActivityLogPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const logs = await getActivityLogs(params);
    const stats = await getActivityStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                <p className="text-muted-foreground">Audit trail of all administrative actions</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.today}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.thisWeek}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Activity</CardTitle>
                    <CardDescription>
                        Showing most recent {logs.length} actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => {
                                    const Icon = getActionIcon(log.action);
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={log.adminImage || undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {(log.adminFirstName?.[0] || log.adminEmail?.[0] || "A").toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">
                                                        {log.adminFirstName || log.adminEmail?.split("@")[0] || "Unknown"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {formatAction(log.action)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground capitalize">
                                                        {log.targetType}:
                                                    </span>{" "}
                                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                        {log.targetId.length > 12
                                                            ? `${log.targetId.slice(0, 8)}...`
                                                            : log.targetId}
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {log.ipAddress || "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {log.createdAt?.toLocaleString()}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No activity recorded yet</p>
                            <p className="text-sm">Admin actions will appear here as they occur</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
