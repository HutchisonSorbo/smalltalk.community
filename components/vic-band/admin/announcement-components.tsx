"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncementActive } from "@/app/vic-band/admin/announcements/actions";
import { Plus, Trash, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function CreateAnnouncementDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const message = formData.get("message") as string;
        const visibility = formData.get("visibility") as "public" | "private" | "all";
        const isActive = formData.get("isActive") === "on";

        try {
            await createAnnouncement({ message, visibility, isActive });
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                        This message will be displayed at the top of the site.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" required placeholder="Enter announcement text..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <Select name="visibility" defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Everyone (All)</SelectItem>
                                    <SelectItem value="public">Logged Out Only (Public)</SelectItem>
                                    <SelectItem value="private">Logged In Only (Private)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch id="isActive" name="isActive" defaultChecked />
                                <Label htmlFor="isActive">Active Immediately</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function AnnouncementActions({ id, isActive }: { id: string, isActive: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (confirm("Delete this announcement?")) {
            setLoading(true);
            try {
                await deleteAnnouncement(id);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleAnnouncementActive(id, !isActive);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggle} disabled={loading} title={isActive ? "Deactivate" : "Activate"}>
                {isActive ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
}
