import { db } from "@/server/db";
import { adminActivityLog, users } from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, Download, Search, Filter } from "lucide-react";

async function getAuditLogs() {
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
        })
        .from(adminActivityLog)
        .leftJoin(users, eq(adminActivityLog.adminId, users.id))
        .orderBy(desc(adminActivityLog.createdAt))
        .limit(50);

    return logs;
}

function formatAction(action: string): string {
    return action
        .replace(/\./g, " → ")
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default async function AuditLogPage() {
    const logs = await getAuditLogs();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                    <p className="text-muted-foreground">Complete history of administrative actions</p>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search logs..." className="pl-9" />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="user">User Actions</SelectItem>
                                <SelectItem value="content">Content Actions</SelectItem>
                                <SelectItem value="settings">Settings Changes</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="7d">
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Time Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>{logs.length} records shown</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length > 0 ? (
                        <div className="space-y-2">
                            {logs.map((log: any) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50"
                                >
                                    <FileCheck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                                {log.adminFirstName
                                                    ? `${log.adminFirstName} ${log.adminLastName || ""}`
                                                    : log.adminEmail?.split("@")[0] || "Unknown Admin"}
                                            </span>
                                            <span className="text-muted-foreground">performed</span>
                                            <Badge variant="outline">
                                                {formatAction(log.action || "Unknown Action")}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span>Target: {log.targetType} #{log.targetId?.slice(0, 8)}</span>
                                            <span>•</span>
                                            <span>{log.createdAt?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No audit log entries found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
