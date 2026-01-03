import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Download, Mail, Bell, Users } from "lucide-react";

const DEMO_HISTORY = [
    {
        id: "1",
        subject: "System Maintenance Notice",
        type: "email",
        audience: "All Users",
        recipients: 1240,
        sentAt: new Date("2026-01-02T14:30:00"),
        sentBy: "Admin",
        status: "delivered",
    },
    {
        id: "2",
        subject: "New Feature: Work Experience Hub",
        type: "notification",
        audience: "All Users",
        recipients: 1240,
        sentAt: new Date("2026-01-01T10:00:00"),
        sentBy: "Admin",
        status: "delivered",
    },
    {
        id: "3",
        subject: "Weekly Community Digest",
        type: "email",
        audience: "Newsletter Subscribers",
        recipients: 890,
        sentAt: new Date("2025-12-29T08:00:00"),
        sentBy: "System",
        status: "delivered",
    },
    {
        id: "4",
        subject: "Platform Update",
        type: "both",
        audience: "Organisations",
        recipients: 156,
        sentAt: new Date("2025-12-28T11:00:00"),
        sentBy: "Admin",
        status: "delivered",
    },
];

export default function MessageHistoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Message History</h1>
                    <p className="text-muted-foreground">View past communications and their delivery status</p>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export History
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="flex flex-wrap gap-4 py-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-9" />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="30d">
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* History List */}
            <Card>
                <CardHeader>
                    <CardTitle>Sent Messages</CardTitle>
                    <CardDescription>{DEMO_HISTORY.length} messages in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {DEMO_HISTORY.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-start justify-between p-4 rounded-lg border"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-muted">
                                        {message.type === "email" ? (
                                            <Mail className="h-5 w-5" />
                                        ) : message.type === "notification" ? (
                                            <Bell className="h-5 w-5" />
                                        ) : (
                                            <Mail className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{message.subject}</h3>
                                            <Badge variant="outline" className="capitalize">
                                                {message.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {message.audience}
                                            </span>
                                            <span>{message.recipients.toLocaleString()} recipients</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Sent by {message.sentBy} • {message.sentAt.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {message.status}
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
