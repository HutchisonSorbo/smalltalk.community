import { db } from "@/server/db";
import { siteSettings, featureFlags } from "@shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Settings, ToggleLeft, Database, Lock, Globe } from "lucide-react";
import Link from "next/link";

async function getSiteSettings() {
    const settings = await db.select().from(siteSettings);
    return settings;
}

async function getFeatureFlags() {
    const flags = await db.select().from(featureFlags);
    return flags;
}

export default async function SettingsPage() {
    const settings = await getSiteSettings();
    const flags = await getFeatureFlags();

    const enabledFlags = flags.filter(f => f.isEnabled).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                <p className="text-muted-foreground">Platform configuration and preferences</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Site Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{settings.length}</div>
                        <p className="text-xs text-muted-foreground">configured</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{flags.length}</div>
                        <p className="text-xs text-muted-foreground">total flags</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Enabled Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{enabledFlags}</div>
                        <p className="text-xs text-muted-foreground">active</p>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Platform Settings
                    </CardTitle>
                    <CardDescription>Key-value configuration for the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    {settings.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {settings.map((setting) => (
                                    <TableRow key={setting.id}>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {setting.key}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {typeof setting.value === "object"
                                                    ? JSON.stringify(setting.value)
                                                    : String(setting.value)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {setting.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {setting.updatedAt?.toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No site settings configured yet</p>
                            <p className="text-sm">Settings can be added via the database</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/settings/features">
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Feature Flags
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Platform Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Platform Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground">Platform Name</p>
                            <p className="font-medium">smalltalk.community</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground">Environment</p>
                            <Badge variant="outline">{process.env.NODE_ENV}</Badge>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground">Database</p>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                <span>Connected</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground">Security</p>
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-green-600" />
                                <span>RLS Enabled</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
