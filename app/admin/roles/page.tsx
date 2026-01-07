import { db } from "@/server/db";
import { sysRoles, sysUserRoles, users } from "@shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Shield, Users, UserCog } from "lucide-react";

async function getRoles() {
    try {
        const roles = await db
            .select({
                id: sysRoles.id,
                name: sysRoles.name,
                description: sysRoles.description,
                createdAt: sysRoles.createdAt,
            })
            .from(sysRoles)
            .orderBy(sysRoles.name);

        // Get user count per role
        const roleUsers = await db
            .select({
                roleId: sysUserRoles.roleId,
                count: count(),
            })
            .from(sysUserRoles)
            .groupBy(sysUserRoles.roleId);

        const roleUserMap = new Map(roleUsers.map(r => [r.roleId, r.count]));

        return roles.map(role => ({
            ...role,
            userCount: roleUserMap.get(role.id) ?? 0,
        }));
    } catch (error) {
        console.error("[Admin Roles] Error fetching roles:", error);
        return [];
    }
}

async function getRoleMembers() {
    try {
        const members = await db
            .select({
                roleId: sysUserRoles.roleId,
                roleName: sysRoles.name,
                userId: sysUserRoles.userId,
                userFirstName: users.firstName,
                userLastName: users.lastName,
                userEmail: users.email,
                userImage: users.profileImageUrl,
                createdAt: sysUserRoles.createdAt,
            })
            .from(sysUserRoles)
            .innerJoin(sysRoles, eq(sysUserRoles.roleId, sysRoles.id))
            .innerJoin(users, eq(sysUserRoles.userId, users.id))
            .orderBy(desc(sysUserRoles.createdAt))
            .limit(20);

        return members;
    } catch (error) {
        console.error("[Admin Roles] Error fetching role members:", error);
        return [];
    }
}

export default async function RolesAdminPage() {
    const roles = await getRoles();
    const recentMembers = await getRoleMembers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                <p className="text-muted-foreground">Manage system roles and user assignments</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roles.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {roles.reduce((sum, r) => sum + r.userCount, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {roles.filter(r => r.userCount > 0).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        System Roles
                    </CardTitle>
                    <CardDescription>Available roles in the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    {roles.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserCog className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium capitalize">
                                                    {role.name?.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {role.description || "No description"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={role.userCount > 0 ? "default" : "secondary"}>
                                                {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {role.createdAt?.toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No roles defined yet</p>
                            <p className="text-sm">Create roles to manage platform permissions</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Role Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recent Role Assignments
                    </CardTitle>
                    <CardDescription>Users recently assigned to roles</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentMembers.length > 0 ? (
                        <div className="space-y-4">
                            {recentMembers.map((member) => (
                                <div key={`${member.roleId}-${member.userId}`} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.userImage || undefined} />
                                        <AvatarFallback>
                                            {(member.userFirstName?.[0] || member.userEmail?.[0] || "?").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {member.userFirstName} {member.userLastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {member.roleName?.replace(/_/g, " ")}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            No role assignments yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
