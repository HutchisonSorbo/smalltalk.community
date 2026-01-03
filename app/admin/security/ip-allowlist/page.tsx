"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, CheckCircle } from "lucide-react";

// Demo data - Uses RFC 5737 documentation IP ranges for examples
// 192.0.2.0/24 (TEST-NET-1), 198.51.100.0/24 (TEST-NET-2), 203.0.113.0/24 (TEST-NET-3)
const DEMO_ALLOWLIST = [
    {
        id: "1",
        ipAddress: "203.0.113.89",
        description: "Office IP - Melbourne HQ",
        addedBy: "Admin",
        addedAt: new Date("2025-12-15"),
    },
    {
        id: "2",
        ipAddress: "192.0.2.0/24",
        description: "Internal Network Range",
        addedBy: "Admin",
        addedAt: new Date("2025-11-20"),
    },
    {
        id: "3",
        ipAddress: "198.51.100.50",
        description: "Developer Home",
        addedBy: "Admin",
        addedAt: new Date("2025-12-28"),
    },
];

export default function IPAllowlistPage() {
    const [newIP, setNewIP] = useState("");
    const [newDescription, setNewDescription] = useState("");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">IP Allowlist</h1>
                <p className="text-muted-foreground">Manage trusted IP addresses for admin access</p>
            </div>

            {/* Status */}
            <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <Key className="h-8 w-8 text-blue-600" />
                    <div>
                        <p className="font-medium text-blue-700">IP Allowlist: Active</p>
                        <p className="text-sm text-blue-600">Only allowlisted IPs can access admin panel</p>
                    </div>
                    <Button variant="outline" className="ml-auto">
                        Disable Allowlist
                    </Button>
                </CardContent>
            </Card>

            {/* Add New IP */}
            <Card>
                <CardHeader>
                    <CardTitle>Add IP Address</CardTitle>
                    <CardDescription>Add a trusted IP address or CIDR range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="IP Address (e.g., 192.168.1.1 or 10.0.0.0/8)"
                            value={newIP}
                            onChange={(e) => setNewIP(e.target.value)}
                            className="max-w-xs font-mono"
                        />
                        <Input
                            placeholder="Description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="flex-1"
                        />
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add IP
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Current Allowlist */}
            <Card>
                <CardHeader>
                    <CardTitle>Allowed IP Addresses</CardTitle>
                    <CardDescription>{DEMO_ALLOWLIST.length} IPs currently allowed</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {DEMO_ALLOWLIST.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between p-4 rounded-lg border"
                            >
                                <div className="flex items-center gap-4">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-mono font-medium">{entry.ipAddress}</p>
                                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right text-sm text-muted-foreground">
                                        <p>Added by {entry.addedBy}</p>
                                        <p>{entry.addedAt.toLocaleDateString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Current Session Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Current Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="font-mono">
                            Your IP: Loading...
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Make sure to add your IP before enabling the allowlist
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
