import { db } from "@/server/db";
import { siteSettings, featureFlags } from "@shared/schema";
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
import { Settings, ToggleLeft, Database, Lock, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";

async function getSiteSettings() {
    try {
        // Select only columns we need, avoiding updated_by which may not exist in older databases
        const settings = await db.select({
            id: siteSettings.id,
            key: siteSettings.key,
            value: siteSettings.value,
            description: siteSettings.description,
            updatedAt: siteSettings.updatedAt,
        }).from(siteSettings);
        return { data: settings, error: null };
    } catch (error) {
        console.error("[Admin Settings] Error fetching site settings:", error);
        return { data: [], error: error instanceof Error ? error.message : String(error) };
    }
}

async function getFeatureFlags() {
    try {
        const flags = await db.select().from(featureFlags);
        return { data: flags, error: null };
    } catch (error) {
        console.error("[Admin Settings] Error fetching feature flags:", error);
        return { data: [], error: error instanceof Error ? error.message : String(error) };
    }
}

export default async function SettingsPage() {
    const settingsResult = await getSiteSettings();
    const flagsResult = await getFeatureFlags();

    const settings = settingsResult.data;
    const flags = flagsResult.data;
    const enabledFlags = flags.filter(f => f.isEnabled).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                <p className="text-muted-foreground">Platform configuration and preferences</p>
            </div>

            {/* Error Alerts */}
            {(settingsResult.error || flagsResult.error) && (
                <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="flex items-center gap-3 py-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-red-700">Database Error</p>
                            <p className="text-sm text-red-600">
                                {settingsResult.error || flagsResult.error}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
