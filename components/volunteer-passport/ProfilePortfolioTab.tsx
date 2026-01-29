"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, FileText, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { getPortfolioItems, upsertPortfolioItem, deletePortfolioItem } from "@/app/volunteer-passport/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";

export function ProfilePortfolioTab({ userId }: { userId: string }) {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        url: "",
        type: "link",
    });

    useEffect(() => {
        async function load() {
            const data = await getPortfolioItems(userId);
            setItems(data);
            setIsLoading(false);
        }
        load();
    }, [userId]);

    const handleAdd = async () => {
        if (!newItem.title) return;
        setIsSaving(true);
        const result = await upsertPortfolioItem(userId, {
            ...newItem,
            type: newItem.type,
        });

        if (result.success) {
            const updated = await getPortfolioItems(userId);
            setItems(updated);
            setIsAdding(false);
            setNewItem({ title: "", description: "", url: "", type: "link" });
            toast({ title: "Portfolio item added" });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSaving(false);
    };

    const handleDelete = async (itemId: string) => {
        const result = await deletePortfolioItem(userId, itemId);
        if (result.success) {
            setItems(items.filter(i => i.id !== itemId));
            toast({ title: "Item deleted" });
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center animate-pulse">Loading portfolio...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Showcase Portfolio</h3>
                    <p className="text-sm text-muted-foreground">Add links to your work, projects, or professional profiles.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} size="sm" variant={isAdding ? "outline" : "default"}>
                    <Plus className={`h-4 w-4 mr-2 ${isAdding ? "rotate-45" : ""}`} />
                    {isAdding ? "Cancel" : "Add Item"}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm">New Portfolio Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Title</label>
                                <Input
                                    placeholder="Project name or achievement"
                                    className="text-xs"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Type</label>
                                <select
                                    className="w-full rounded border p-2 text-xs dark:bg-gray-800"
                                    value={newItem.type}
                                    onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                    title="Portfolio Item Type"
                                >
                                    <option value="link">Website/Link</option>
                                    <option value="document">Document/Report</option>
                                    <option value="media">Image/Video</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">URL (Optional)</label>
                            <Input
                                placeholder="https://..."
                                className="text-xs"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Description</label>
                            <Textarea
                                placeholder="Briefly explain this item..."
                                className="text-xs h-20"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isSaving} className="w-full" size="sm">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save to Portfolio
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">Your portfolio is empty. Add your first item to showcase your impact!</p>
                    </div>
                ) : (
                    items.map(item => (
                        <Card key={item.id} className="overflow-hidden group">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                        {item.type === 'media' ? <ImageIcon className="h-4 w-4" /> :
                                            item.type === 'document' ? <FileText className="h-4 w-4" /> :
                                                <ExternalLink className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm">{item.title}</CardTitle>
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                                {new URL(item.url).hostname} <ExternalLink className="h-2 w-2" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Item"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </CardHeader>
                            {item.description && (
                                <CardContent className="px-4 pb-4 pt-0">
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
