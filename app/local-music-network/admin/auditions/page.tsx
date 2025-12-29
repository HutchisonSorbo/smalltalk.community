import { db } from "@/server/db";
import { classifieds } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuditionActionsCell, CreateAuditionButton } from "@/components/local-music-network/admin/audition-actions";
import { desc } from "drizzle-orm";

export default async function AuditionsPage() {
    const allClassifieds = await db.select().from(classifieds).orderBy(desc(classifieds.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Auditions</h2>
                    <p className="text-muted-foreground">
                        Manage audition listings.
                    </p>
                </div>
                <CreateAuditionButton />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allClassifieds.map((ad) => (
                            <TableRow key={ad.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{ad.title}</span>
                                        <span className="text-xs text-muted-foreground">{ad.genre || "N/A"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {ad.type?.replace("_", " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>{ad.instrument}</TableCell>
                                <TableCell>{ad.location}</TableCell>
                                <TableCell>
                                    <AuditionActionsCell id={ad.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// CodeRabbit Audit Trigger
