import { db } from "@/server/db";
import { users } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActionsCell } from "@/components/local-music-network/admin/user-actions-cell";
import { desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function UsersPage() {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">
                        Manage system users and permissions.
                    </p>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Identity</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                                        <AvatarFallback>{(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {user.userType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.isAdmin && (
                                        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                                            Admin
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                                <TableCell>
                                    <UserActionsCell userId={user.id} isAdmin={user.isAdmin || false} />
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
