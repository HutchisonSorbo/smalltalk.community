import { db } from "@/server/db";
import { organisations, organisationMembers, users } from "@shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Building2, Users } from "lucide-react";

async function getOrganisations() {
    const orgs = await db.select().from(organisations).orderBy(desc(organisations.createdAt));
    return orgs;
}

async function getOrgStats() {
    const [total] = await db.select({ count: count() }).from(organisations);
    const [members] = await db.select({ count: count() }).from(organisationMembers);

    return {
        total: total?.count ?? 0,
        totalMembers: members?.count ?? 0,
    };
}

export default async function OrganisationsAdminPage() {
    const orgs = await getOrganisations();
    const stats = await getOrgStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organisations</h1>
                <p className="text-muted-foreground">Manage registered organisations</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Organisations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMembers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Members/Org</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total > 0
                                ? (stats.totalMembers / stats.total).toFixed(1)
                                : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Organisations Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        All Organisations
                    </CardTitle>
                    <CardDescription>Registered organisations from Volunteer Passport</CardDescription>
                </CardHeader>
                <CardContent>
                    {orgs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organisation</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead>ABN</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orgs.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={org.logoUrl || undefined} />
                                                    <AvatarFallback>
                                                        {org.name?.[0]?.toUpperCase() || "O"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{org.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {org.description || "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {org.website ? (
                                                <a
                                                    href={org.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline text-sm"
                                                >
                                                    Website
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {org.abn ? (
                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                    {org.abn}
                                                </code>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {org.isVerified ? (
                                                <Badge className="bg-green-500">Verified</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {org.createdAt?.toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No organisations registered yet</p>
                            <p className="text-sm">Organisations will appear here when they sign up</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
