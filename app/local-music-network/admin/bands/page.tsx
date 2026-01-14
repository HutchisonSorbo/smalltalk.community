import { db } from "@/server/db";
import { bands } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BandActionsCell, CreateBandButton } from "@/components/local-music-network/admin/band-actions";
import { desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function BandsPage() {
    const allBands = await db.select().from(bands).orderBy(desc(bands.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bands</h2>
                    <p className="text-muted-foreground">
                        Manage registered bands.
                    </p>
                </div>
                <CreateBandButton />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Genres</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allBands.map((band: any) => (
                            <TableRow key={band.id}>
                                <TableCell>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={band.profileImageUrl || ""} alt={band.name} />
                                        <AvatarFallback>{band.name[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{band.name}</span>
                                        <span className="text-xs text-muted-foreground">{band.websiteUrl || "No website"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {band.genres.slice(0, 3).map((g: any) => (
                                            <Badge key={g} variant="secondary" className="text-xs">
                                                {g}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>{band.location}</TableCell>
                                <TableCell>{band.createdAt ? new Date(band.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                                <TableCell>
                                    <BandActionsCell id={band.id} />
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
