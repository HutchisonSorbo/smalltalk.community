import { db } from "@/server/db";
import { featureFlags } from "@shared/schema";
import { desc } from "drizzle-orm";
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
import { ToggleLeft, Check, X } from "lucide-react";
import { FeatureFlagToggle } from "./feature-flag-toggle";

async function getFeatureFlags() {
    const flags = await db.select().from(featureFlags).orderBy(featureFlags.name);
    return flags;
}

export default async function FeatureFlagsPage() {
    const flags = await getFeatureFlags();
    const enabledCount = flags.filter(f => f.isEnabled).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
                <p className="text-muted-foreground">Toggle platform features on and off</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{flags.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Enabled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{enabledCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Disabled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                            {flags.length - enabledCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Flags Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ToggleLeft className="h-5 w-5" />
                        All Feature Flags
                    </CardTitle>
                    <CardDescription>Manage feature availability across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    {flags.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Feature</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Toggle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flags.map((flag) => (
                                    <TableRow key={flag.id}>
                                        <TableCell className="font-medium">{flag.name}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {flag.key}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                                            {flag.description || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {flag.enabledForRoles && flag.enabledForRoles.length > 0 ? (
                                                <div className="flex gap-1 flex-wrap">
                                                    {flag.enabledForRoles.map(role => (
                                                        <Badge key={role} variant="outline" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">All users</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {flag.isEnabled ? (
                                                <Badge className="bg-green-500">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Enabled
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <X className="h-3 w-3 mr-1" />
                                                    Disabled
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <FeatureFlagToggle
                                                flagId={flag.id}
                                                isEnabled={flag.isEnabled}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <ToggleLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No feature flags configured yet</p>
                            <p className="text-sm">Feature flags can be added via the database</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
