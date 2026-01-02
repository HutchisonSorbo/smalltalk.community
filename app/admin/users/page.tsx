import { db } from "@/server/db";
import { users } from "@shared/schema";
import { desc, like, or, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

async function getUsers() {
    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(100);

    return allUsers;
}

export default async function UsersAdminPage() {
    const allUsers = await getUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">View and manage platform users</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Showing last 100 users by registration date</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Account Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Onboarding</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {user.profileImageUrl ? (
                                                <img
                                                    src={user.profileImageUrl}
                                                    alt=""
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                    {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.accountType || "Individual"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {user.isAdmin && (
                                                <Badge variant="default">Admin</Badge>
                                            )}
                                            {user.isMinor && (
                                                <Badge variant="secondary">Minor</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.onboardingCompleted ? (
                                            <Badge variant="default" className="bg-green-500">Complete</Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Step {user.onboardingStep || 0}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt?.toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
