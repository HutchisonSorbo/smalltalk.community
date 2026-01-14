import { db } from "@/server/db";
import { apps } from "@shared/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FlaskConical } from "lucide-react";

async function getApps() {
    try {
        const allApps = await db
            .select()
            .from(apps)
            .orderBy(desc(apps.createdAt));

        return { apps: allApps, error: null };
    } catch (error) {
        console.error("[Admin Apps] Error fetching apps:", error);
        return { apps: [], error: error instanceof Error ? error.message : "Failed to load apps" };
    }
}

export default async function AppsAdminPage() {
    const { apps: allApps, error } = await getApps();

    const activeCount = allApps.filter((a: any) => a.isActive).length;
    const betaCount = allApps.filter((a: any) => a.isBeta).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">App Management</h1>
                    <p className="text-muted-foreground">Manage platform applications</p>
                </div>
                <Button asChild>
                    <Link href="/admin/apps/test">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Test Apps
                    </Link>
                </Button>
            </div>

            {error && (
                <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="py-4">
                        <p className="font-medium text-red-700">Failed to load apps</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allApps.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Beta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{betaCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Apps</CardTitle>
                    <CardDescription>Platform application registry</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Age Restriction</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allApps.length > 0 ? allApps.map((app: any) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {app.iconUrl ? (
                                                <img
                                                    src={app.iconUrl}
                                                    alt=""
                                                    className="h-8 w-8 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium">
                                                    {app.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{app.name}</div>
                                                <div className="text-xs text-muted-foreground max-w-xs truncate">
                                                    {app.description}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{app.category || "General"}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {app.route || "-"}
                                    </TableCell>
                                    <TableCell>{app.ageRestriction || "all_ages"}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {app.isActive ? (
                                                <Badge variant="default" className="bg-green-500">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                            {app.isBeta && (
                                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">Beta</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No apps found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
