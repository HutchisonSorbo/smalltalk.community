"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Plus } from "lucide-react";
import { deleteClassified, seedClassified } from "@/app/vic-band/admin/auditions/actions";
import { useState } from "react";

export function AuditionActionsCell({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this audition?")) {
            setLoading(true);
            try {
                await deleteClassified(id);
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
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Audition
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function CreateAuditionButton() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            await seedClassified();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleSeed} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Create Test Audition
        </Button>
    );
}
