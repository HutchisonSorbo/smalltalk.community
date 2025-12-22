import { db } from "@/server/db";
import { gigs } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GigActionsCell, CreateGigButton } from "@/components/admin/gig-actions";
import { desc } from "drizzle-orm";

export default async function GigsPage() {
    const allGigs = await db.select().from(gigs).orderBy(desc(gigs.date));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gigs</h2>
                    <p className="text-muted-foreground">
                        Manage upcoming gigs.
                    </p>
                </div>
                <CreateGigButton />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allGigs.map((gig) => (
                            <TableRow key={gig.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{gig.title}</span>
                                        <span className="text-xs text-muted-foreground">{gig.genre}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{gig.location}</TableCell>
                                <TableCell>{new Date(gig.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {gig.price ? `$${(gig.price / 100).toFixed(2)}` : "Free"}
                                </TableCell>
                                <TableCell>
                                    <GigActionsCell id={gig.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
