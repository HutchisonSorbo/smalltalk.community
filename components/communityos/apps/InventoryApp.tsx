/**
 * Inventory App Component
 * A Ditto-enabled Inventory tool for tracking organizational assets and supplies
 */

"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string;
    minStockLevel: number;
    lastChecked: string;
}

export function InventoryApp() {
    const { tenant, isLoading } = useTenant();

    // Always call hooks unconditionally
    const { documents: items, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<InventoryItem>(tenant?.id ? `${tenant.id}:inventory_items` : "");

    const [isEditing, setIsEditing] = useState<string | null>(null); // Reverted to original type to maintain functionality
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});

    // Guard against missing tenant
    if (isLoading) {
        return <div className="p-4"><div className="h-6 w-48 rounded bg-gray-200 animate-pulse" /></div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load Inventory - Organisation context not available.</p>
            </div>
        );
    }

    const handleSave = () => {
        if (formData.name && formData.quantity !== undefined) {
            upsertDocument(
                isEditing || Math.random().toString(36).substr(2, 9),
                {
                    name: formData.name,
                    category: formData.category || "General",
                    quantity: Number(formData.quantity),
                    unit: formData.unit || "pcs",
                    location: formData.location || "Store Room",
                    minStockLevel: Number(formData.minStockLevel || 0),
                    lastChecked: new Date().toISOString(),
                    ...formData,
                } as InventoryItem
            );
            setIsEditing(null);
            setFormData({});
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h2>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage community supplies and equipment.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500">{isOnline ? "Online Syncing" : "Offline Mode"}</span>
                    </div>
                    <button
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ quantity: 0, minStockLevel: 5 });
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold">{isEditing === "new" ? "New Item" : "Edit Item"}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                            <input
                                type="text"
                                title="Item Name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <input
                                type="text"
                                title="Category"
                                value={formData.category || ""}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input
                                type="number"
                                title="Quantity"
                                value={formData.quantity || 0}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                            <input
                                type="text"
                                title="Location"
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No items in inventory. Add your first item.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {item.category}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.quantity <= item.minStockLevel ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            }`}>
                                            {item.quantity} {item.unit}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {item.location}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setIsEditing(item.id);
                                                setFormData(item);
                                            }}
                                            className="mr-3 text-primary hover:text-primary/80"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteDocument(item.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
