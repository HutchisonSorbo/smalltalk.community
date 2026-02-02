"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Package, Hash, MapPin, Tag } from "lucide-react";

interface QuickAddProps {
    onAdd: (item: any) => void;
    onCancel: () => void;
    className?: string;
}

export function QuickAdd({ onAdd, onCancel, className }: QuickAddProps) {
    const [formData, setFormData] = useState({
        name: "",
        sku: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        category: "General",
        location: "Main Storage",
        quantity: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className={cn("p-4 bg-card border rounded-lg shadow-lg", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Quick Add Item
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Package className="w-3.5 h-3.5" /> Item Name
                    </label>
                    <input
                        required
                        className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Wireless Microphone"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Hash className="w-3.5 h-3.5" /> SKU / Tag
                        </label>
                        <input
                            required
                            className="w-full px-3 py-2 bg-background border rounded-md text-sm font-mono"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Tag className="w-3.5 h-3.5" /> Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Tag className="w-3.5 h-3.5" /> Category
                        </label>
                        <select
                            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>General</option>
                            <option>Electronics</option>
                            <option>Furniture</option>
                            <option>Stationery</option>
                            <option>Kitchen</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" /> Location
                        </label>
                        <select
                            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        >
                            <option>Main Storage</option>
                            <option>Front Desk</option>
                            <option>Kitchen</option>
                            <option>Meeting Room A</option>
                            <option>Meeting Room B</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 shadow-sm transition-colors"
                    >
                        Add Item
                    </button>
                </div>
            </form>
        </div>
    );
}
