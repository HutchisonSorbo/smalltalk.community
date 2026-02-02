/**
 * Generic App Component Template
 * Used to quickly generate the remaining 17 apps with real Ditto sync
 * Enhanced with Premium UI: Search, Filters, Bulk Actions, and View Toggle.
 */

"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { COSModal } from "../ui/cos-modal";
import { COSSkeleton } from "../ui/cos-skeleton";
import { moderateContent } from "@/lib/utils/moderation";
import { COSEmptyState } from "../ui/cos-empty-state";
import { COSSearch } from "../ui/cos-search";
import { COSFilterBar, FilterOption } from "../ui/cos-filter-bar";
import { COSBulkActions } from "../ui/cos-bulk-actions";
import { Plus, FolderOpen, LayoutGrid, List, MoreVertical, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { communityOSApps } from "../apps-config";

interface GenericItem {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

/**
 * Validates form data against app configuration.
 * Returns { valid: true } or { valid: false, error: string }.
 */
function validateFormData(formData: Partial<GenericItem>, appConfig?: any) {
    const trimmedTitle = formData.title?.trim();
    if (!trimmedTitle) {
        return { valid: false, error: "Title is required" };
    }

    if (appConfig?.fields) {
        for (const field of appConfig.fields) {
            const val = formData.metadata?.[field.id];
            const isEmpty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '');

            if (field.required && isEmpty) {
                return { valid: false, error: `${field.label} is required` };
            }
        }
    }

    return { valid: true };
}

/**
 * Sanitizes metadata by removing non-serializable values and normalizing dates/strings.
 */
function sanitizeMetadata(rawMetadata: Record<string, any>) {
    const sanitized: Record<string, any> = {};

    Object.entries(rawMetadata).forEach(([key, value]) => {
        if (value === undefined || typeof value === 'function') return;
        if (value instanceof Date) {
            sanitized[key] = value.toISOString();
        } else if (typeof value === 'string') {
            sanitized[key] = value.trim();
        } else {
            sanitized[key] = value;
        }
    });

    return sanitized;
}

/**
 * Returns a safe representation of an item for logging based on the environment.
 */
function getSafeLogData(id: string, itemType: string, payload?: any) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
        return { id, itemType };
    }
    return { id, itemType, payload };
}

type ViewMode = 'grid' | 'list';

export function GenericCommunityApp({
    appId,
    title,
    description,
    placeholder,
    itemType = "Item"
}: {
    appId: string;
    title: string;
    description: string;
    placeholder: string;
    itemType?: string;
}) {
    const { tenant, isLoading } = useTenant();

    // Data Sync
    const { documents: items, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<GenericItem>({
            collection: `${appId}_data`,
            tenantId: tenant?.id || ""
        });

    // --- State ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<GenericItem>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Focus management for modal
    useEffect(() => {
        if (isEditing) {
            // Use a small timeout to ensure modal is rendered and visible
            const timer = setTimeout(() => {
                titleInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isEditing]);

    const [quickFilters, setQuickFilters] = useState<FilterOption[]>([
        { id: 'all', label: 'All', active: true },
        { id: 'active', label: 'Active', active: false },
        { id: 'archived', label: 'Archived', active: false },
    ]);

    // --- Derived Data ---
    const appConfig = useMemo(() => communityOSApps.find(a => a.id === appId), [appId]);

    // --- Moderated Content ---
    const moderatedItems = useMemo(() => {
        return items.map(item => ({
            ...item,
            moderatedTitle: moderateContent(item.title),
            moderatedDescription: moderateContent(item.description),
            moderatedMetadata: Object.entries(item.metadata || {}).reduce((acc, [key, val]) => {
                acc[key] = typeof val === 'string' ? moderateContent(val) : val;
                return acc;
            }, {} as Record<string, any>)
        }));
    }, [items]);

    const filteredItems = useMemo(() => {
        let result = moderatedItems || [];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.moderatedTitle.toLowerCase().includes(q) ||
                item.moderatedDescription.toLowerCase().includes(q)
            );
        }

        // Status Filter
        const activeFilter = quickFilters.find(f => f.active && f.id !== 'all');
        if (activeFilter) {
            result = result.filter(item =>
                item.status.toLowerCase() === activeFilter.label.toLowerCase()
            );
        }

        return result;
    }, [moderatedItems, searchQuery, quickFilters]);

    // --- Handlers ---
    const handleSave = useCallback(async () => {
        const id = isEditing === "new" ? crypto.randomUUID() : (isEditing as string);
        if (!id) return;

        // 1. Validation
        const validation = validateFormData(formData, appConfig);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        // 2. Sanitization
        const sanitizedMetadata = sanitizeMetadata(formData.metadata || {});

        const finalItem: GenericItem = {
            id,
            title: formData.title!.trim(),
            description: formData.description?.trim() || "",
            status: formData.status || "Active",
            createdAt: formData.createdAt || new Date().toISOString(),
            metadata: sanitizedMetadata
        };

        try {
            console.log(`[GenericCommunityApp] Saving ${itemType}:`, getSafeLogData(id, itemType, finalItem));
            await upsertDocument(id, finalItem);
            setIsEditing(null);
            setFormData({});
            toast.success(`${itemType} saved`);
        } catch (err) {
            console.error(`[GenericCommunityApp] Error saving ${itemType}:`, {
                ...getSafeLogData(id, itemType, finalItem),
                error: err instanceof Error ? err.message : String(err)
            });
            toast.error(`Failed to save ${itemType.toLowerCase()}. Please try again.`);
        }
    }, [formData, isEditing, itemType, upsertDocument, appConfig]);

    const updateMetadata = useCallback((fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...(prev.metadata || {}),
                [fieldId]: value
            }
        }));
    }, []);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        const count = selectedIds.size;
        const idsToDelete = Array.from(selectedIds);

        try {
            console.log(`[GenericCommunityApp] Batch deleting ${count} ${itemType}s:`, { ids: idsToDelete, type: itemType });
            await Promise.all(idsToDelete.map(id => deleteDocument(id)));
            setSelectedIds(new Set());
            toast.success(`Deleted ${count} ${itemType.toLowerCase()}s`);
        } catch (err) {
            console.error(`[GenericCommunityApp] Error batch deleting ${itemType}s:`, {
                ids: idsToDelete,
                type: itemType,
                error: err instanceof Error ? err.message : String(err)
            });
            toast.error(`Failed to delete some ${itemType.toLowerCase()}s. Please try again.`);
        }
    }, [selectedIds, itemType, deleteDocument]);

    const handleFilterClick = useCallback((id: string) => {
        setQuickFilters(prev => prev.map(f => ({
            ...f,
            active: f.id === id
        })));
    }, []);

    // --- Loading/Error States ---
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <COSSkeleton variant="text" className="h-8 w-48" />
                    <COSSkeleton variant="text" className="h-8 w-32" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <COSSkeleton key={i} variant="card" className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load {title} - Organisation context not available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full space-y-6 max-w-full">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-lg border border-border/50">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewMode === 'grid' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewMode === 'list' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ status: "Active", metadata: {} });
                        }}
                        className="btn-primary flex items-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span>Add {itemType}</span>
                    </button>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="w-full md:w-80">
                    <COSSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={`Search ${itemType.toLowerCase()}s...`}
                    />
                </div>
                <div className="flex-1 overflow-x-auto pb-1">
                    <COSFilterBar
                        filters={quickFilters}
                        onFilterClick={handleFilterClick}
                        onClearAll={() => handleFilterClick('all')}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {filteredItems.length === 0 ? (
                    <COSEmptyState
                        title={`No ${title} found`}
                        description={searchQuery ? "Try adjusting your search or filters." : placeholder}
                        icon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
                        action={!searchQuery ? {
                            label: `Create ${itemType}`,
                            onClick: () => {
                                setIsEditing("new");
                                setFormData({ status: "Active", metadata: {} });
                            }
                        } : undefined}
                    />
                ) : (
                    <div className={cn(
                        "grid gap-4",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border/50",
                                    selectedIds.has(item.id) && "ring-2 ring-primary border-primary/50 bg-primary/5"
                                )}
                            >
                                {/* Selection Indicator */}
                                <button
                                    type="button"
                                    onClick={() => toggleSelection(item.id)}
                                    className={cn(
                                        "absolute top-3 right-3 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                                        selectedIds.has(item.id) ? "opacity-100 text-primary" : "text-muted-foreground"
                                    )}
                                    aria-label={selectedIds.has(item.id) ? "Deselect item" : "Select item"}
                                >
                                    {selectedIds.has(item.id) ? (
                                        <CheckCircle2 className="w-5 h-5 fill-primary text-background" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="flex items-start justify-between mb-3 pr-8">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                                            {item.moderatedTitle}
                                        </h4>
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                            item.status === 'Active' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                item.status === 'Archived' ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" :
                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="flex-1 text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                    {item.moderatedDescription}
                                </p>

                                {/* Metadata Badges */}
                                {appConfig?.fields && (
                                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                                        {appConfig.fields.slice(0, 3).map(f => {
                                            const val = item.moderatedMetadata?.[f.id];
                                            if (!val) return null;
                                            return (
                                                <span key={f.id} className="text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border/50 text-muted-foreground truncate max-w-[120px]">
                                                    {f.label}: {val}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                        Added {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(item.id);
                                                setFormData({ ...item, metadata: item.metadata || {} });
                                            }}
                                            className="p-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPendingDeleteId(item.id);
                                                setShowConfirmDelete(true);
                                            }}
                                            className="p-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selection & Bulk Actions */}
            <COSBulkActions
                selectedCount={selectedIds.size}
                onClear={() => setSelectedIds(new Set())}
                onDelete={handleDeleteSelected}
                label={itemType.toLowerCase() + (selectedIds.size === 1 ? "" : "s")}
            />

            {/* Edit Modal */}
            <COSModal
                isOpen={!!isEditing}
                onClose={() => setIsEditing(null)}
                title={isEditing === "new" ? `New ${itemType}` : `Edit ${itemType}`}
                description={`Provide details for this ${itemType.toLowerCase()}. Fields are synced in real-time.`}
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button
                            type="button"
                            onClick={() => setIsEditing(null)}
                            className="btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn-primary"
                        >
                            Save {itemType}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <label htmlFor="generic-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                        <input
                            id="generic-title"
                            ref={titleInputRef}
                            type="text"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={`e.g. ${itemType} Name`}
                            className="cos-input"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="generic-description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                        <textarea
                            id="generic-description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter detailed description..."
                            rows={3}
                            className="cos-input"
                        />
                    </div>

                    {/* Dynamic Fields */}
                    {appConfig?.fields?.map(field => (
                        <div key={field.id} className="space-y-2">
                            <label htmlFor={`field-${field.id}`} className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    id={`field-${field.id}`}
                                    value={formData.metadata?.[field.id] || ""}
                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                    className="cos-input"
                                    required={field.required}
                                >
                                    <option value="">Select {field.label}...</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    id={`field-${field.id}`}
                                    value={formData.metadata?.[field.id] || ""}
                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="cos-input"
                                    required={field.required}
                                />
                            ) : (
                                <input
                                    id={`field-${field.id}`}
                                    type={field.type}
                                    value={formData.metadata?.[field.id] || ""}
                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="cos-input"
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}

                    <div className="space-y-2">
                        <label htmlFor="generic-status" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                        <select
                            id="generic-status"
                            value={formData.status || "Active"}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="cos-input"
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>
            </COSModal>

            {/* Sync Status Footer Overlay (Subtle) */}
            {!isOnline && (
                <div className="fixed bottom-24 right-6 animate-in slide-in-from-bottom-4">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Offline Mode - Changes will sync later
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <COSModal
                isOpen={showConfirmDelete}
                onClose={() => {
                    setShowConfirmDelete(false);
                    setPendingDeleteId(null);
                }}
                title={`Delete this ${itemType.toLowerCase()}?`}
                description="This action cannot be undone. This item will be removed from your local database and synced with other devices."
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowConfirmDelete(false);
                                setPendingDeleteId(null);
                            }}
                            className="btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                if (pendingDeleteId) {
                                    try {
                                        await deleteDocument(pendingDeleteId);
                                        toast.success("Item deleted");
                                    } catch (err) {
                                        console.error("[GenericCommunityApp] Error deleting item:", err);
                                        toast.error("Failed to delete item");
                                    } finally {
                                        setShowConfirmDelete(false);
                                        setPendingDeleteId(null);
                                    }
                                }
                            }}
                            className="btn-primary bg-red-600 hover:bg-red-700 border-red-600"
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="flex items-center gap-4 text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-red-500" />
                    <p>Are you sure you want to remove this record?</p>
                </div>
            </COSModal>
        </div>
    );
}
