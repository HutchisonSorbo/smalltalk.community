import { db } from "@/server/db";
import { reports, users } from "@shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react";

async function getModerationStats() {
    const [pending, reviewed, resolved, dismissed] = await Promise.all([
        db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "reviewed")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "resolved")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "dismissed")),
    ]);

    return {
        pending: pending[0]?.count ?? 0,
        reviewed: reviewed[0]?.count ?? 0,
        resolved: resolved[0]?.count ?? 0,
        dismissed: dismissed[0]?.count ?? 0,
    };
}

async function getPendingReports() {
    const pendingReports = await db
        .select({
            id: reports.id,
            targetType: reports.targetType,
            targetId: reports.targetId,
            reason: reports.reason,
            description: reports.description,
            status: reports.status,
            createdAt: reports.createdAt,
            reporterFirstName: users.firstName,
            reporterEmail: users.email,
        })
        .from(reports)
        .leftJoin(users, eq(reports.reporterId, users.id))
        .where(eq(reports.status, "pending"))
        .orderBy(desc(reports.createdAt))
        .limit(20);

    return pendingReports;
}

export default async function ModerationQueuePage() {
    const stats = await getModerationStats();
    const pendingReports = await getPendingReports();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
                <p className="text-muted-foreground">Review and manage reported content</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className={stats.pending > 0 ? "border-yellow-500/50" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                        <Eye className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.reviewed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.resolved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dismissed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Queue Tabs */}
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending ({stats.pending})
                    </TabsTrigger>
                    <TabsTrigger value="reviewed">Under Review</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    <TabsTrigger value="all">All Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Reports</CardTitle>
                            <CardDescription>Reports awaiting moderation review</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingReports.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Flag className="h-4 w-4 text-yellow-600" />
                                                        <span className="font-medium capitalize">
                                                            {report.reason?.replace(/_/g, " ")}
                                                        </span>
                                                        <Badge variant="outline">
                                                            {report.targetType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {report.description || "No additional details provided"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reported by {report.reporterFirstName || report.reporterEmail?.split("@")[0]} •{" "}
                                                        {report.createdAt?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="destructive">
                                                        Take Action
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                    <p className="font-medium">All caught up!</p>
                                    <p className="text-sm">No pending reports to review</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviewed">
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Reports under active review will appear here
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="resolved">
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Resolved reports will appear here
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Full report history will appear here
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
