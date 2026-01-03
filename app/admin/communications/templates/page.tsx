"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Edit, Copy, Trash2 } from "lucide-react";

const DEMO_TEMPLATES = [
    {
        id: "1",
        name: "Welcome Email",
        subject: "Welcome to smalltalk.community!",
        description: "Sent to new users after signup",
        lastUpdated: new Date("2025-12-20"),
        status: "active",
    },
    {
        id: "2",
        name: "Password Reset",
        subject: "Reset your password",
        description: "Password reset request email",
        lastUpdated: new Date("2025-11-15"),
        status: "active",
    },
    {
        id: "3",
        name: "Weekly Digest",
        subject: "Your weekly community update",
        description: "Weekly newsletter with opportunities",
        lastUpdated: new Date("2025-12-28"),
        status: "active",
    },
    {
        id: "4",
        name: "Report Resolved",
        subject: "Your report has been reviewed",
        description: "Notification when a user report is resolved",
        lastUpdated: new Date("2025-12-10"),
        status: "draft",
    },
];

export default function EmailTemplatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
                    <p className="text-muted-foreground">Manage system email templates</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </div>

            {/* Template List */}
            <div className="grid gap-4">
                {DEMO_TEMPLATES.map((template) => (
                    <Card key={template.id}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{template.name}</h3>
                                        <Badge
                                            variant={template.status === "active" ? "default" : "secondary"}
                                        >
                                            {template.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Subject: {template.subject}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {template.description} • Updated {template.lastUpdated.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Template Variables */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Variables</CardTitle>
                    <CardDescription>Use these placeholders in your templates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border font-mono text-sm">
                            {"{{user.firstName}}"}
                        </div>
                        <div className="p-3 rounded-lg border font-mono text-sm">
                            {"{{user.email}}"}
                        </div>
                        <div className="p-3 rounded-lg border font-mono text-sm">
                            {"{{site.name}}"}
                        </div>
                        <div className="p-3 rounded-lg border font-mono text-sm">
                            {"{{current.year}}"}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
