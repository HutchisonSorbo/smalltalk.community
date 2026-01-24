import { db } from "@/server/db";
import { reports, users } from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

async function getReports() {
    try {
        const allReports = await db
            .select({
                id: reports.id,
                reporterId: reports.reporterId,
                targetType: reports.targetType,
                targetId: reports.targetId,
                reason: reports.reason,
                description: reports.description,
                status: reports.status,
                createdAt: reports.createdAt,
                reporterEmail: users.email,
                reporterName: users.firstName,
            })
            .from(reports)
            .leftJoin(users, eq(reports.reporterId, users.id))
            .orderBy(desc(reports.createdAt))
            .limit(100);

        return allReports;
    } catch (error) {
        console.error("[Admin Reports] Error fetching reports:", error);
        return [];
    }
}


function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "pending":
            return "destructive";
        case "reviewed":
            return "secondary";
        case "resolved":
            return "default";
        case "dismissed":
            return "outline";
        default:
            return "secondary";
    }
}

export default async function ReportsAdminPage() {
    const allReports = await getReports();

    const pendingCount = allReports.filter((r: any) => r.status === "pending").length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports & Moderation</h1>
                <p className="text-muted-foreground">Review and manage user reports</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allReports.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Reports</CardTitle>
                    <CardDescription>Showing last 100 reports by date</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reporter</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allReports.length > 0 ? allReports.map((report: any) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <div className="text-sm">
                                            {report.reporterName || "Unknown"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {report.reporterEmail}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{report.targetType}</Badge>
                                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                                            {report.targetId.slice(0, 8)}...
                                        </div>
                                    </TableCell>
                                    <TableCell>{report.reason}</TableCell>
                                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                        {report.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(report.status || "pending")}>
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {report.createdAt?.toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No reports found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
