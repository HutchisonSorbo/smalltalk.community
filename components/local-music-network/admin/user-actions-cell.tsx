"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";
import { deleteUser, toggleAdminStatus } from "@/app/Local Music Network/admin/users/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserActionsCellProps {
    userId: string;
    isAdmin: boolean;
}

export function UserActionsCell({ userId, isAdmin }: UserActionsCellProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleToggleAdmin = async () => {
        setLoading(true);
        try {
            await toggleAdminStatus(userId, !isAdmin);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            setLoading(true);
            try {
                await deleteUser(userId);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleToggleAdmin}>
                    {isAdmin ? "Revoke Admin" : "Make Admin"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
