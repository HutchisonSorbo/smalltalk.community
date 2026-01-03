import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, MapPin, Clock, RefreshCw } from "lucide-react";

// Demo data - In production, this would come from a rate limiting / auth log table
const DEMO_FAILED_LOGINS = [
    {
        id: "1",
        email: "unknown@example.com",
        ipAddress: "192.168.1.100",
        location: "Melbourne, VIC",
        attempts: 5,
        lastAttempt: new Date("2026-01-03T18:30:00"),
        status: "blocked",
    },
    {
        id: "2",
        email: "user@test.com",
        ipAddress: "10.0.0.50",
        location: "Sydney, NSW",
        attempts: 3,
        lastAttempt: new Date("2026-01-03T17:45:00"),
        status: "warning",
    },
    {
        id: "3",
        email: "admin@example.org",
        ipAddress: "172.16.0.25",
        location: "Brisbane, QLD",
        attempts: 2,
        lastAttempt: new Date("2026-01-03T16:20:00"),
        status: "normal",
    },
];

export default function FailedLoginsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Failed Login Attempts</h1>
                    <p className="text-muted-foreground">Monitor and manage suspicious login activity</p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                        <Lock className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">1</div>
                        <p className="text-xs text-muted-foreground">currently blocked</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warning Threshold</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">1</div>
                        <p className="text-xs text-muted-foreground">approaching limit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Attempts (24h)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10</div>
                        <p className="text-xs text-muted-foreground">failed logins</p>
                    </CardContent>
                </Card>
            </div>

            {/* Failed Login List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Failed Attempts</CardTitle>
                    <CardDescription>IPs with multiple failed login attempts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {DEMO_FAILED_LOGINS.map((attempt) => (
                            <div
                                key={attempt.id}
                                className={`p-4 rounded-lg border ${attempt.status === "blocked"
                                        ? "border-destructive/50 bg-destructive/5"
                                        : attempt.status === "warning"
                                            ? "border-yellow-500/50 bg-yellow-500/5"
                                            : "border-border"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{attempt.email}</p>
                                            <Badge
                                                variant={
                                                    attempt.status === "blocked"
                                                        ? "destructive"
                                                        : attempt.status === "warning"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                            >
                                                {attempt.status === "blocked"
                                                    ? "Blocked"
                                                    : attempt.status === "warning"
                                                        ? "Warning"
                                                        : "Normal"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="font-mono">{attempt.ipAddress}</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {attempt.location}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {attempt.attempts} attempts • Last: {attempt.lastAttempt.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {attempt.status !== "blocked" && (
                                            <Button variant="destructive" size="sm">
                                                Block IP
                                            </Button>
                                        )}
                                        {attempt.status === "blocked" && (
                                            <Button variant="outline" size="sm">
                                                Unblock
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Rate Limiting Settings</CardTitle>
                    <CardDescription>Configure failed login thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Warning Threshold</p>
                            <p className="text-2xl font-bold">3</p>
                            <p className="text-xs text-muted-foreground">attempts before warning</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Block Threshold</p>
                            <p className="text-2xl font-bold">5</p>
                            <p className="text-xs text-muted-foreground">attempts before auto-block</p>
                        </div>
                    </div>
                    <Button variant="outline">Configure Thresholds</Button>
                </CardContent>
            </Card>
        </div>
    );
}
