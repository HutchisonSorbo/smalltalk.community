import { db } from "@/server/db";
import { musicianProfiles } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MusicianActionsCell, CreateMusicianButton } from "@/components/local-music-network/admin/musician-actions";
import { desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MusiciansPage() {
    const musicians = await db.select().from(musicianProfiles).orderBy(desc(musicianProfiles.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Musicians</h2>
                    <p className="text-muted-foreground">
                        Manage musician profiles.
                    </p>
                </div>
                <CreateMusicianButton />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Instruments</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {musicians.map((musician: any) => (
                            <TableRow key={musician.id}>
                                <TableCell>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={musician.profileImageUrl || ""} alt={musician.name} />
                                        <AvatarFallback>{musician.name[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{musician.name}</span>
                                        <span className="text-xs text-muted-foreground">{musician.userId}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {musician.instruments.slice(0, 3).map((inst: any) => (
                                            <Badge key={inst} variant="secondary" className="text-xs">
                                                {inst}
                                            </Badge>
                                        ))}
                                        {musician.instruments.length > 3 && (
                                            <Badge variant="outline" className="text-xs">+{musician.instruments.length - 3}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{musician.location}</TableCell>
                                <TableCell>
                                    <MusicianActionsCell id={musician.id} />
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
