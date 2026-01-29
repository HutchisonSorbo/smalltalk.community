"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { getPortfolioItems, upsertPortfolioItem, deletePortfolioItem } from "@/app/volunteer-passport/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { safeUrl, moderateContent } from "@/lib/utils";

function usePortfolio(userId: string) {
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

    const load = useCallback(async () => {
        try {
            const data = await getPortfolioItems(userId);
            setItems(data);
        } catch (error) {
            console.error(`[Portfolio] Error loading items for user ${userId}:`, error);
            toast({
                title: "Error",
                description: "Failed to load portfolio items. Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [userId, toast]);

    const handleAdd = async () => {
        const trimmedTitle = newItem.title.trim();
        const trimmedDesc = newItem.description.trim();
        const allowedTypes = ["link", "document", "media"];

        if (!trimmedTitle) {
            toast({ title: "Validation Error", description: "A title is required for your portfolio item.", variant: "destructive" });
            return;
        }

        const sanitisedUrl = newItem.url.trim() ? safeUrl(newItem.url.trim()) : "";
        const validatedType = allowedTypes.includes(newItem.type) ? newItem.type : "link";

        setIsSaving(true);
        try {
            const result = await upsertPortfolioItem(userId, {
                title: trimmedTitle.slice(0, 100),
                description: trimmedDesc.slice(0, 500),
                url: sanitisedUrl,
                type: validatedType,
            });

            if (result.success) {
                const updated = await getPortfolioItems(userId);
                setItems(updated);
                setIsAdding(false);
                setNewItem({ title: "", description: "", url: "", type: "link" });
                toast({ title: "Success", description: "Portfolio item added successfully." });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            console.error(`[Portfolio] Error adding item for user ${userId}:`, error);
            toast({ title: "Error", description: "Failed to save to portfolio. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        try {
            const result = await deletePortfolioItem(userId, itemId);
            if (result.success) {
                setItems(prev => prev.filter(i => i.id !== itemId));
                toast({ title: "Success", description: "Portfolio item deleted." });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            console.error(`[Portfolio] Error deleting item ${itemId} for user ${userId}:`, error);
            toast({ title: "Error", description: "Failed to delete item. Please try again.", variant: "destructive" });
        }
    };

    return { items, isLoading, isSaving, isAdding, setIsAdding, newItem, setNewItem, handleAdd, handleDelete, load };
}

function PortfolioHeader({ isAdding, onToggle }: { isAdding: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-bold">Showcase Portfolio</h3>
                <p className="text-sm text-muted-foreground">Add links to your work, projects, or professional profiles.</p>
            </div>
            <Button onClick={onToggle} size="sm" variant={isAdding ? "outline" : "default"}>
                <Plus className={`h-4 w-4 mr-2 ${isAdding ? "rotate-45" : ""}`} />
                {isAdding ? "Cancel" : "Add Item"}
            </Button>
        </div>
    );
}

function PortfolioForm({ newItem, setNewItem, onSave, isSaving }: { newItem: any; setNewItem: (val: any) => void; onSave: () => void; isSaving: boolean }) {
    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-sm">New Portfolio Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="portfolio-title" className="text-xs font-medium">Title</label>
                        <Input
                            id="portfolio-title"
                            placeholder="Project name or achievement"
                            className="text-xs"
                            value={newItem.title}
                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="portfolio-type" className="text-xs font-medium">Type</label>
                        <select
                            id="portfolio-type"
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
                    <label htmlFor="portfolio-url" className="text-xs font-medium">URL (Optional)</label>
                    <Input
                        id="portfolio-url"
                        placeholder="https://..."
                        className="text-xs"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="portfolio-description" className="text-xs font-medium">Description</label>
                    <Textarea
                        id="portfolio-description"
                        placeholder="Briefly explain this item..."
                        className="text-xs h-20"
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    />
                </div>
                <Button onClick={onSave} disabled={isSaving} className="w-full" size="sm">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save to Portfolio
                </Button>
            </CardContent>
        </Card>
    );
}

function PortfolioItem({ item, onDelete }: { item: any; onDelete: () => void }) {
    const moderatedTitle = moderateContent(item.title);
    const moderatedDesc = item.description ? moderateContent(item.description) : "";

    return (
        <Card className="overflow-hidden group">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {item.type === 'media' ? <ImageIcon className="h-4 w-4" /> :
                            item.type === 'document' ? <FileText className="h-4 w-4" /> :
                                <ExternalLink className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-sm truncate">{moderatedTitle}</CardTitle>
                        {item.url && (
                            <a
                                href={safeUrl(item.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline flex items-center gap-1"
                            >
                                {(() => {
                                    try {
                                        return new URL(item.url).hostname;
                                    } catch {
                                        return "View Link";
                                    }
                                })()} <ExternalLink className="h-2 w-2" />
                            </a>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label={`Delete ${moderatedTitle}`}
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Item"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </CardHeader>
            {moderatedDesc && (
                <CardContent className="px-4 pb-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">{moderatedDesc}</p>
                </CardContent>
            )}
        </Card>
    );
}

function PortfolioList({ items, onDelete }: { items: any[]; onDelete: (id: string) => void }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Your portfolio is empty. Add your first item to showcase your impact!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {items.map(item => (
                <PortfolioItem key={item.id} item={item} onDelete={() => onDelete(item.id)} />
            ))}
        </div>
    );
}

export function ProfilePortfolioTab({ userId }: { userId: string }) {
    const portfolio = usePortfolio(userId);

    useEffect(() => {
        portfolio.load();
    }, [portfolio.load]);

    if (portfolio.isLoading) {
        return <div className="p-12 text-center animate-pulse">Initialising portfolio...</div>;
    }

    return (
        <div className="space-y-6 max-w-full">
            <PortfolioHeader
                isAdding={portfolio.isAdding}
                onToggle={() => portfolio.setIsAdding(!portfolio.isAdding)}
            />

            {portfolio.isAdding && (
                <PortfolioForm
                    newItem={portfolio.newItem}
                    setNewItem={portfolio.setNewItem}
                    onSave={portfolio.handleAdd}
                    isSaving={portfolio.isSaving}
                />
            )}

            <PortfolioList items={portfolio.items} onDelete={portfolio.handleDelete} />
        </div>
    );
}