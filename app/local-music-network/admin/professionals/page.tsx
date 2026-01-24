import { db } from "@/server/db";
import { professionalProfiles } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProfessionalActionsCell, CreateProfessionalButton } from "@/components/local-music-network/admin/professional-actions";
import { desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfessionalsPage() {
    const pros = await db.select().from(professionalProfiles).orderBy(desc(professionalProfiles.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Professionals</h2>
                    <p className="text-muted-foreground">
                        Manage professional profiles.
                    </p>
                </div>
                <CreateProfessionalButton />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Business/Role</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pros.map((pro: any) => (
                            <TableRow key={pro.id}>
                                <TableCell>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={pro.profileImageUrl || ""} alt={pro.businessName || pro.role} />
                                        <AvatarFallback>{(pro.businessName?.[0] || pro.role[0]).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{pro.businessName || "Independent"}</span>
                                        <span className="text-xs text-muted-foreground">{pro.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{pro.location}</TableCell>
                                <TableCell>
                                    {pro.verified ? (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Verified</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">No</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <ProfessionalActionsCell id={pro.id} />
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
