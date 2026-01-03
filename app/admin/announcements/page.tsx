import { db } from "@/server/db";
import { announcements, users } from "@shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Megaphone, Plus, Eye, EyeOff, Edit } from "lucide-react";
import { AnnouncementActionsClient } from "./announcement-actions-client";

async function getAnnouncements() {
    const allAnnouncements = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt));

    return allAnnouncements;
}

async function getAnnouncementStats() {
    const [total, active] = await Promise.all([
        db.select({ count: count() }).from(announcements),
        db.select({ count: count() }).from(announcements).where(eq(announcements.isActive, true)),
    ]);

    return {
        total: total[0]?.count ?? 0,
        active: active[0]?.count ?? 0,
    };
}

function getVisibilityBadge(visibility: string | null) {
    switch (visibility) {
        case "public":
            return <Badge variant="outline" className="bg-green-500/10 text-green-700">Public</Badge>;
        case "private":
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Private</Badge>;
        default:
            return <Badge variant="outline">All</Badge>;
    }
}

export default async function AnnouncementsAdminPage() {
    const allAnnouncements = await getAnnouncements();
    const stats = await getAnnouncementStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Manage platform announcements</p>
                </div>
                <AnnouncementActionsClient mode="create" />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                            {stats.total - stats.active}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Announcements Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5" />
                        All Announcements
                    </CardTitle>
                    <CardDescription>Manage site-wide announcements</CardDescription>
                </CardHeader>
                <CardContent>
                    {allAnnouncements.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title / Message</TableHead>
                                    <TableHead>Visibility</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allAnnouncements.map((announcement) => (
                                    <TableRow key={announcement.id}>
                                        <TableCell>
                                            <div>
                                                {announcement.title && (
                                                    <p className="font-medium">{announcement.title}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                                                    {announcement.message}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getVisibilityBadge(announcement.visibility)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {announcement.priority ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {announcement.isActive ? (
                                                <Badge className="bg-green-500">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {announcement.createdAt?.toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AnnouncementActionsClient
                                                mode="edit"
                                                announcement={announcement}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No announcements yet</p>
                            <p className="text-sm">Create your first announcement to notify users</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
