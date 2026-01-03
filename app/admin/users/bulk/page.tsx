"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users,
    Search,
    Download,
    UserX,
    Mail,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Filter
} from "lucide-react";

// Demo user data
const DEMO_USERS = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", status: "active", role: "individual", createdAt: "2025-11-15" },
    { id: "2", name: "Mitchell Community Centre", email: "info@mcc.org", status: "active", role: "organisation", createdAt: "2025-10-20" },
    { id: "3", name: "James Wilson", email: "james.w@email.com", status: "suspended", role: "individual", createdAt: "2025-12-01" },
    { id: "4", name: "Local Music Hub", email: "contact@lmh.com", status: "active", role: "organisation", createdAt: "2025-09-10" },
    { id: "5", name: "Emma Davis", email: "emma.d@mail.com", status: "active", role: "individual", createdAt: "2025-12-20" },
];

export default function BulkActionsPage() {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAll = () => {
        if (selectedUsers.length === DEMO_USERS.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(DEMO_USERS.map((u) => u.id));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk User Actions</h1>
                <p className="text-muted-foreground">Perform actions on multiple users at once</p>
            </div>

            {/* Warning */}
            <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                        <p className="font-medium text-yellow-700">Bulk actions are irreversible</p>
                        <p className="text-sm text-yellow-600">
                            Please review your selection carefully before proceeding
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="flex flex-wrap gap-4 py-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="individual">Individuals</SelectItem>
                            <SelectItem value="organisation">Organisations</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Apply
                    </Button>
                </CardContent>
            </Card>

            {/* User Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Select Users</CardTitle>
                            <CardDescription>
                                {selectedUsers.length} of {DEMO_USERS.length} users selected
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleAll}>
                            {selectedUsers.length === DEMO_USERS.length ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {DEMO_USERS.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedUsers.includes(user.id)
                                        ? "border-primary bg-primary/5"
                                        : "hover:bg-muted/50"
                                    }`}
                                onClick={() => toggleUser(user.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => toggleUser(user.id)}
                                    />
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="capitalize">
                                        {user.role}
                                    </Badge>
                                    <Badge
                                        variant={user.status === "active" ? "default" : "destructive"}
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Actions</CardTitle>
                    <CardDescription>
                        {selectedUsers.length > 0
                            ? `Apply to ${selectedUsers.length} selected user(s)`
                            : "Select users to enable actions"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0}
                        >
                            <Mail className="h-6 w-6 mb-2" />
                            <span>Send Email</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0}
                        >
                            <UserX className="h-6 w-6 mb-2" />
                            <span>Suspend Users</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0}
                        >
                            <CheckCircle className="h-6 w-6 mb-2" />
                            <span>Reactivate</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0}
                        >
                            <Download className="h-6 w-6 mb-2" />
                            <span>Export Data</span>
                        </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="destructive"
                            disabled={selectedUsers.length === 0}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected Users
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
