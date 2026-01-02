"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Shield, ShieldOff, UserX, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    isAdmin: boolean | null;
}

interface UserActionsClientProps {
    user: User;
}

export function UserActionsClient({ user }: UserActionsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleToggleAdmin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAdmin: !user.isAdmin }),
            });

            if (!response.ok) {
                throw new Error("Failed to update user");
            }

            toast.success(
                user.isAdmin
                    ? "Admin privileges removed"
                    : "Admin privileges granted"
            );
            router.refresh();
        } catch (error) {
            toast.error("Failed to update user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            toast.success("User deleted successfully");
            router.push("/admin/users");
        } catch (error) {
            toast.error("Failed to delete user");
            setIsLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Actions
                                <MoreVertical className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleToggleAdmin}>
                        {user.isAdmin ? (
                            <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
                            This action cannot be undone. All user data, profiles, and content will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
