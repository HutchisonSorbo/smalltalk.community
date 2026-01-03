"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
    id: string;
    title: string | null;
    message: string;
    visibility: string | null;
    priority: number | null;
    isActive: boolean | null;
}

interface AnnouncementActionsClientProps {
    mode: "create" | "edit";
    announcement?: Announcement;
}

export function AnnouncementActionsClient({ mode, announcement }: AnnouncementActionsClientProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: announcement?.title ?? "",
        message: announcement?.message ?? "",
        visibility: announcement?.visibility ?? "all",
        priority: announcement?.priority ?? 0,
        isActive: announcement?.isActive ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = mode === "create"
                ? "/api/admin/announcements"
                : `/api/admin/announcements/${announcement?.id}`;

            const method = mode === "create" ? "POST" : "PATCH";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to save announcement");
            }

            toast.success(mode === "create" ? "Announcement created" : "Announcement updated");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to save announcement");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!announcement) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete announcement");
            }

            toast.success("Announcement deleted");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete announcement");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === "create" ? (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "Create Announcement" : "Edit Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "create"
                                ? "Create a new platform announcement"
                                : "Update the announcement details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title (Optional)</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Internal reference title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="The announcement message to display..."
                                required
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select
                                    value={formData.visibility}
                                    onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="public">Public Only</SelectItem>
                                        <SelectItem value="private">Logged In Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isActive">Active</Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        {mode === "edit" && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {mode === "create" ? "Create" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
