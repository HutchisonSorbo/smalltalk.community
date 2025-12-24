import { db } from "@/server/db";
import { announcements } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AnnouncementActions, CreateAnnouncementDialog } from "@/components/Local Music Network/admin/announcement-components";
import { desc } from "drizzle-orm";

export default async function AnnouncementsPage() {
    const allAnnouncements = await db.select().from(announcements).orderBy(desc(announcements.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
                    <p className="text-muted-foreground">
                        Manage global site announcements.
                    </p>
                </div>
                <CreateAnnouncementDialog />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[400px]">Message</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allAnnouncements.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.message}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {item.visibility}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.isActive ? "default" : "secondary"}>
                                        {item.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                                <TableCell>
                                    <AnnouncementActions id={item.id} isActive={item.isActive || false} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
