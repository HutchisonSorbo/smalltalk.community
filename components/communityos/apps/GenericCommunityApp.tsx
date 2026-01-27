/**
 * Generic App Component Template
 * Used to quickly generate the remaining 17 apps with real Ditto sync
 */

"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";

interface GenericItem {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

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

    // Always call hooks unconditionally
    const { documents: items, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<GenericItem>({
            collection: `${appId}_data`,
            tenantId: tenant?.id || ""
        });

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<GenericItem>>({});

    // Guard against missing tenant
    if (isLoading) {
        return <div className="p-4"><div className="h-6 w-48 rounded bg-gray-200 animate-pulse" /></div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load {title} - Organisation context not available.</p>
            </div>
        );
    }

    const handleSave = () => {
        if (formData.title) {
            upsertDocument(
                isEditing === "new" ? crypto.randomUUID() : (isEditing as string),
                {
                    title: formData.title,
                    description: formData.description || "",
                    status: formData.status || "Active",
                    createdAt: new Date().toISOString(),
                    ...formData,
                } as GenericItem
            );
            setIsEditing(null);
            setFormData({});
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500">{isOnline ? "Online Syncing" : "Offline Mode"}</span>
                    </div>
                    <button
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ status: "Active" });
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                    >
                        Add {itemType}
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold">{isEditing === "new" ? `New ${itemType}` : `Edit ${itemType}`}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                type="text"
                                title="Title"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                title="Description"
                                placeholder="Enter description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditing(null)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 ? (
                    <div className="col-span-full rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
                        {placeholder}
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-2 flex items-start justify-between">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {item.status}
                                </span>
                            </div>
                            <p className="flex-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                                <span className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(item.id);
                                            setFormData(item);
                                        }}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteDocument(item.id)}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
