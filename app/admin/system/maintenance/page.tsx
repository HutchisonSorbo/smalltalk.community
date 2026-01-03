"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, CheckCircle, Power, Clock } from "lucide-react";

export default function MaintenanceModePage() {
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
    const [message, setMessage] = useState(
        "We're currently performing scheduled maintenance. Please check back shortly."
    );
    const [estimatedDuration, setEstimatedDuration] = useState("30");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Maintenance Mode</h1>
                <p className="text-muted-foreground">Control platform availability during maintenance</p>
            </div>

            {/* Current Status */}
            <Card className={maintenanceEnabled ? "border-yellow-500/50 bg-yellow-500/5" : "border-green-500/50 bg-green-500/5"}>
                <CardContent className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                        {maintenanceEnabled ? (
                            <Wrench className="h-8 w-8 text-yellow-600" />
                        ) : (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                        <div>
                            <p className={`font-medium ${maintenanceEnabled ? "text-yellow-700" : "text-green-700"}`}>
                                {maintenanceEnabled ? "Maintenance Mode Active" : "Platform Online"}
                            </p>
                            <p className={`text-sm ${maintenanceEnabled ? "text-yellow-600" : "text-green-600"}`}>
                                {maintenanceEnabled
                                    ? "Users see the maintenance page"
                                    : "All users can access the platform normally"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                            {maintenanceEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                            checked={maintenanceEnabled}
                            onCheckedChange={setMaintenanceEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Warning when enabled */}
            {maintenanceEnabled && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-center gap-4 py-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <div>
                            <p className="font-medium text-destructive">Platform is currently offline</p>
                            <p className="text-sm text-destructive/80">
                                Regular users cannot access the platform. Only admins can browse.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Configuration */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance Message</CardTitle>
                        <CardDescription>This message is shown to users during maintenance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[120px]"
                            placeholder="Enter maintenance message..."
                        />
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Estimated Duration (minutes)</label>
                                <Input
                                    type="number"
                                    value={estimatedDuration}
                                    onChange={(e) => setEstimatedDuration(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    ~{estimatedDuration} min
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">
                            Save Message
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>How the maintenance page appears to users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 rounded-lg border-2 border-dashed text-center">
                            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-bold mb-2">Under Maintenance</h3>
                            <p className="text-sm text-muted-foreground mb-4">{message}</p>
                            <Badge variant="outline">
                                Estimated: {estimatedDuration} minutes
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button
                        variant={maintenanceEnabled ? "default" : "outline"}
                        onClick={() => setMaintenanceEnabled(!maintenanceEnabled)}
                    >
                        <Power className="w-4 h-4 mr-2" />
                        {maintenanceEnabled ? "End Maintenance" : "Enable Maintenance"}
                    </Button>
                    <Button variant="outline">Schedule Maintenance</Button>
                    <Button variant="outline">View Maintenance History</Button>
                </CardContent>
            </Card>
        </div>
    );
}
