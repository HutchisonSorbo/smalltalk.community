"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { BarcodeScanner } from "./inventory/barcode-scanner";
import { QuickAdd, type InventoryItem } from "./inventory/quick-add";
import { Scan, Plus, Search, AlertCircle, Package, Hash, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COSModal } from "../ui/cos-modal";

// Local interface removed in favor of imported InventoryItem from quick-add.tsx

export function InventoryApp() {
    const { tenant, isLoading } = useTenant();

    // Always call hooks unconditionally
    const { documents: items, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<InventoryItem>({
            collection: "inventory_items",
            tenantId: tenant?.id || ""
        });

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);
    const [pendingScanCode, setPendingScanCode] = useState<string | null>(null);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<InventoryItem>>({});
    const [searchQuery, setSearchQuery] = useState("");

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

    const handleSave = async () => {
        if (formData.name && formData.quantity !== undefined) {
            try {
                const id = isEditing === "new" ? crypto.randomUUID() : String(isEditing);

                // Sanitize and validate
                const sanitized = {
                    id,
                    name: formData.name.trim().replace(/[<>]/g, ''),
                    category: (formData.category || "General").trim().replace(/[<>]/g, ''),
                    quantity: Math.max(0, parseInt(String(formData.quantity)) || 0),
                    unit: (formData.unit || "pcs").trim().replace(/[<>]/g, ''),
                    location: (formData.location || "Store Room").trim().replace(/[<>]/g, ''),
                    minStockLevel: Math.max(0, parseInt(String(formData.minStockLevel)) || 0),
                    lastChecked: new Date().toISOString(),
                    sku: (formData.sku || `INV-${Math.floor(Math.random() * 10000)}`).trim().replace(/[^a-zA-Z0-9-_]/g, ''),
                    description: (formData.description || "").trim().replace(/[<>]/g, '')
                };

                await upsertDocument(id, sanitized as InventoryItem);
                setIsEditing(null);
                setFormData({});
            } catch (err) {
                console.error("Failed to save inventory item:", err);
            }
        }
    };

    const handleScan = (code: string) => {
        const existingItem = items.find(i => i.sku === code || i.id === code);

        if (existingItem) {
            // If item exists, open edit mode 
            setIsScanning(false);
            setFormData(existingItem);
            setIsEditing(existingItem.id ?? null);
            setScanMessage(`Found item: ${existingItem.name}`);
        } else {
            // If not found, show modal to add
            setPendingScanCode(code);
        }
    };

    const handleCreateFromScan = () => {
        if (pendingScanCode) {
            setIsScanning(false);
            setFormData({
                sku: pendingScanCode,
                quantity: 1,
                minStockLevel: 5
            });
            setIsEditing("new");
            setPendingScanCode(null);
        }
    };

    const handleQuickAdd = async (data: InventoryItem) => {
        try {
            const id = crypto.randomUUID();
            const sanitized = {
                id,
                name: data.name.trim().replace(/[<>]/g, ''),
                sku: (data.sku || `INV-${Math.floor(Math.random() * 10000)}`).trim().replace(/[^a-zA-Z0-9-_]/g, ''),
                category: (data.category || "General").trim().replace(/[<>]/g, ''),
                location: (data.location || "Main Storage").trim().replace(/[<>]/g, ''),
                quantity: Math.max(1, parseInt(String(data.quantity)) || 1),
                unit: "pcs",
                minStockLevel: 5,
                lastChecked: new Date().toISOString()
            };
            await upsertDocument(id, sanitized as InventoryItem);
            setIsQuickAdding(false);
        } catch (err) {
            console.error("Failed to quick add item:", err);
        }
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteDocument(itemToDelete as any);
                setItemToDelete(null);
            } catch (err) {
                console.error("Failed to delete inventory item:", err);
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="h-6 w-6 text-primary" />
                        Inventory
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage community supplies and equipment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500 hidden sm:inline">{isOnline ? "Synced" : "Offline"}</span>
                    </div>

                    <button
                        onClick={() => setIsScanning(true)}
                        className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Scan className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan</span>
                    </button>

                    <button
                        onClick={() => setIsQuickAdding(true)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Quick Add</span>
                    </button>

                    <button
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ quantity: 0, minStockLevel: 5 });
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Item
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search items by name, SKU, or category..."
                    aria-label="Search inventory items"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {scanMessage && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {scanMessage}
                    <button onClick={() => setScanMessage(null)} className="ml-auto hover:underline">Dismiss</button>
                </div>
            )}

            {isQuickAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <QuickAdd
                        onAdd={handleQuickAdd}
                        onCancel={() => setIsQuickAdding(false)}
                        className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    />
                </div>
            )}

            {isScanning && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScanning(false)}
                />
            )}

            {isEditing && (
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-in zoom-in-95 duration-200">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU / Code</label>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-600">
                                    <Hash className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    title="SKU"
                                    value={formData.sku || ""}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="mt-1 block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                                    placeholder="Scan or enter SKU"
                                />
                            </div>
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
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    title="Quantity"
                                    value={formData.quantity || 0}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                                />
                                <span className="text-sm text-gray-500">{formData.unit || "pcs"}</span>
                            </div>
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
                        <div>
                            <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Stock Level</label>
                            <input
                                id="minStockLevel"
                                type="number"
                                title="Minimum Stock Level"
                                value={formData.minStockLevel || 0}
                                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Item Name / SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    {items.length === 0 ? "No items in inventory. Add your first item." : "No matching items found."}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        {item.sku && <div className="text-xs text-gray-500 font-mono">{item.sku}</div>}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${item.quantity <= (item.minStockLevel ?? 0)
                                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                }`}>
                                                {item.quantity} {item.unit}
                                            </span>
                                            {item.quantity <= (item.minStockLevel ?? 0) && (
                                                <span className="text-[10px] text-red-500 font-medium">Low Stock (Min: {item.minStockLevel})</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            {item.location}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setIsEditing(item.id ?? null);
                                                setFormData(item);
                                            }}
                                            className="mr-3 text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setItemToDelete(item.id ?? null)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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

            {/* Deletion Confirmation Modal */}
            <COSModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Confirm Deletion"
                description="Are you sure you want to delete this item? This action cannot be undone."
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setItemToDelete(null)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="flex items-center gap-4 py-4 text-red-600">
                    <Trash2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">
                        Confirming will permanently remove this item from the organization's inventory records across all synchronized devices.
                    </p>
                </div>
            </COSModal>

            {/* Scan Not Found Modal */}
            <COSModal
                isOpen={!!pendingScanCode}
                onClose={() => setPendingScanCode(null)}
                title="Unknown Item"
                description={`The scanned code "${pendingScanCode}" was not found in current inventory.`}
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setPendingScanCode(null)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Dismiss
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateFromScan}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            Create New Item
                        </button>
                    </div>
                }
            >
                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Would you like to register a new inventory item with this SKU/barcode?
                    </p>
                </div>
            </COSModal>
        </div>
    );
}
