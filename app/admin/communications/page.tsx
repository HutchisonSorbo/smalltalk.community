"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Mail, Bell, AlertTriangle } from "lucide-react";

export default function CommunicationsPage() {
    const [selectedAudience, setSelectedAudience] = useState("all");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mass Messaging</h1>
                <p className="text-muted-foreground">Send notifications and emails to platform users</p>
            </div>

            {/* Warning */}
            <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                        <p className="font-medium text-yellow-700">Use with care</p>
                        <p className="text-sm text-yellow-600">
                            Mass messages are sent immediately and cannot be recalled
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Message Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compose Message</CardTitle>
                            <CardDescription>Create your notification or email</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Subject Line</label>
                                <Input
                                    placeholder="Important update from smalltalk.community"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Message Content</label>
                                <Textarea
                                    placeholder="Write your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-1 min-h-[200px]"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="email" />
                                    <label htmlFor="email" className="text-sm">
                                        Send as email
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="notification" defaultChecked />
                                    <label htmlFor="notification" className="text-sm">
                                        In-app notification
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg border bg-muted/50">
                                <p className="font-medium">{subject || "No subject"}</p>
                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                    {message || "Message content will appear here..."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audience Selection */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Audience</CardTitle>
                            <CardDescription>Choose who receives this message</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="individuals">Individuals Only</SelectItem>
                                    <SelectItem value="organisations">Organisations Only</SelectItem>
                                    <SelectItem value="musicians">Musicians</SelectItem>
                                    <SelectItem value="volunteers">Volunteers</SelectItem>
                                    <SelectItem value="inactive">Inactive Users (30+ days)</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Estimated Recipients</span>
                                </div>
                                <p className="text-2xl font-bold">~1,240</p>
                                <p className="text-xs text-muted-foreground">users will receive this message</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Method</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    <span className="text-sm">In-App Notification</span>
                                </div>
                                <Badge variant="secondary">Instant</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">Email</span>
                                </div>
                                <Badge variant="outline">~5 min</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Button className="w-full" size="lg" disabled={!subject || !message}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                    </Button>
                </div>
            </div>
        </div>
    );
}
