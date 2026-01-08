"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Users,
    Search,
    Download,
    UserX,
    Mail,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    accountType: string | null;
    isAdmin: boolean | null;
    onboardingCompleted: boolean | null;
    createdAt: Date | null;
}

interface BulkActionsClientProps {
    users: User[];
    total: number;
}

export function BulkActionsClient({ users, total }: BulkActionsClientProps) {
    const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSuspending, setIsSuspending] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    // Client-side search filter
    const filteredUsers = users.filter((user) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    const toggleUser = (userId: string) => {
        // Don't allow selecting admins for bulk delete
        const user = users.find(u => u.id === userId);
        if (user?.isAdmin) {
            toast.error("Cannot select admin users for bulk actions");
            return;
        }

        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAll = () => {
        // Filter out admin users from selection
        const nonAdminUsers = filteredUsers.filter(u => !u.isAdmin);
        if (selectedUsers.length === nonAdminUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(nonAdminUsers.map((u) => u.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/users/bulk", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete users");
            }

            const data = await response.json();
            toast.success(`Successfully deleted ${data.deletedCount} users`);
            setSelectedUsers([]);
            setDeleteDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete users");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkExport = async () => {
        if (selectedUsers.length === 0) return;

        setIsExporting(true);
        try {
            const response = await fetch("/api/admin/users/bulk/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedUsers, format: "csv" }),
            });

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Exported ${selectedUsers.length} users`);
        } catch {
            toast.error("Failed to export users");
        } finally {
            setIsExporting(false);
        }
    };

    const handleBulkSuspend = async () => {
        if (selectedUsers.length === 0) return;

        setIsSuspending(true);
        try {
            const response = await fetch("/api/admin/users/bulk/suspend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to suspend users");
            }

            toast.success(`Suspended ${selectedUsers.length} users`);
            setSelectedUsers([]);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to suspend users");
        } finally {
            setIsSuspending(false);
        }
    };

    const handleBulkReactivate = async () => {
        if (selectedUsers.length === 0) return;

        setIsReactivating(true);
        try {
            const response = await fetch("/api/admin/users/bulk/reactivate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to reactivate users");
            }

            toast.success(`Reactivated ${selectedUsers.length} users`);
            setSelectedUsers([]);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reactivate users");
        } finally {
            setIsReactivating(false);
        }
    };

    const nonAdminFilteredCount = filteredUsers.filter(u => !u.isAdmin).length;

    return (
        <>
            {/* Filters */}
            <Card>
                <CardContent className="flex flex-wrap gap-4 py-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* User Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Select Users</CardTitle>
                            <CardDescription>
                                {selectedUsers.length} of {nonAdminFilteredCount} non-admin users selected
                                {total > users.length && ` (showing first ${users.length} of ${total})`}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleAll}>
                            {selectedUsers.length === nonAdminFilteredCount && nonAdminFilteredCount > 0
                                ? "Deselect All"
                                : "Select All"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${user.isAdmin
                                    ? "opacity-50 cursor-not-allowed bg-muted/30"
                                    : selectedUsers.includes(user.id)
                                        ? "border-primary bg-primary/5"
                                        : "hover:bg-muted/50"
                                    }`}
                                onClick={() => !user.isAdmin && toggleUser(user.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => toggleUser(user.id)}
                                        disabled={user.isAdmin || false}
                                    />
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.profileImageUrl || undefined} />
                                        <AvatarFallback>
                                            {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="capitalize">
                                        {user.accountType || "Individual"}
                                    </Badge>
                                    {user.isAdmin && (
                                        <Badge variant="default">Admin</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No users found matching your search</p>
                            </div>
                        )}
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
                            onClick={() => setEmailDialogOpen(true)}
                        >
                            <Mail className="h-6 w-6 mb-2" />
                            <span>Send Email</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0 || isSuspending}
                            onClick={handleBulkSuspend}
                        >
                            {isSuspending ? (
                                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            ) : (
                                <UserX className="h-6 w-6 mb-2" />
                            )}
                            <span>Suspend Users</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0 || isReactivating}
                            onClick={handleBulkReactivate}
                        >
                            {isReactivating ? (
                                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-6 w-6 mb-2" />
                            )}
                            <span>Reactivate</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4"
                            disabled={selectedUsers.length === 0 || isExporting}
                            onClick={handleBulkExport}
                        >
                            {isExporting ? (
                                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            ) : (
                                <Download className="h-6 w-6 mb-2" />
                            )}
                            <span>Export Data</span>
                        </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="destructive"
                            disabled={selectedUsers.length === 0 || isDeleting}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete Selected Users ({selectedUsers.length})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedUsers.length} Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All selected users and their associated
                            data will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Users"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Email Coming Soon Dialog */}
            <AlertDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Send Email - Coming Soon
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Mass email functionality requires email service integration.
                            This feature will be available in a future update.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
