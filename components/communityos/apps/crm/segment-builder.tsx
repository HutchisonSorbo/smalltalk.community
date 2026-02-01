"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, X, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeDisplay } from "@/lib/utils/moderation";

export interface SegmentFilter {
    id: string;
    field: string;
    operator: 'equals' | 'contains' | 'in' | 'starts_with'; // Added 'starts_with'
    value: any;
}

interface SegmentBuilderProps {
    // filters: SegmentFilter[]; // Removed, now managed internally
    // onAddFilter: (filter: SegmentFilter) => void; // Removed
    // onRemoveFilter: (id: string) => void; // Removed
    // onClearAll: () => void; // Removed
    className?: string;
}

// AVAILABLE_FIELDS is no longer used in the new structure, removing it.

export function SegmentBuilder({
    // filters, // Removed
    // onAddFilter, // Removed
    // onRemoveFilter, // Removed
    // onClearAll, // Removed
    className
}: SegmentBuilderProps) {
    // const [open, setOpen] = React.useState(false); // Removed
    const [filters, setFilters] = React.useState<SegmentFilter[]>([]); // New state for filters

    // Convert definitions to UI options for the generic bar if needed
    // But for now we use custom badge rendering for complex segment logic

    // const handleSelectField = (field: string) => { // Removed
    //     // Determine default operator/value based on field type (mock logic)
    //     const newFilter: SegmentFilter = {
    //         id: crypto.randomUUID(),
    //         field,
    //         operator: 'equals',
    //         value: ''
    //     };
    //     onAddFilter(newFilter);
    //     setOpen(false);
    // }; // Removed

    const addFilter = () => {
        setFilters([...filters, {
            id: crypto.randomUUID(),
            field: "status",
            operator: "equals",
            value: ""
        }]);
    };

    const updateFilter = (id: string, updates: Partial<SegmentFilter>) => {
        setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeFilter = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Audience Filters</h3>
                </div>
                <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-2" /> Add Filter
                </Button>
            </div>

            <SegmentFilterList
                filters={filters}
                onUpdate={updateFilter}
                onRemove={removeFilter}
            />

            {filters.length === 0 && (
                <div className="text-center py-8 bg-muted/20 border-2 border-dashed rounded-xl">
                    <p className="text-sm text-muted-foreground">No active filters. This segment includes all contacts.</p>
                </div>
            )}
        </div>
    );
}

interface FilterListProps {
    filters: SegmentFilter[];
    onUpdate: (id: string, updates: Partial<SegmentFilter>) => void;
    onRemove: (id: string) => void;
}

function SegmentFilterList({ filters, onUpdate, onRemove }: FilterListProps) {
    return (
        <div className="space-y-2">
            {filters.map(filter => (
                <div key={filter.id} className="flex flex-wrap items-center gap-2 p-2 bg-card border rounded-lg shadow-sm">
                    <SegmentFilterPicker filter={filter} onUpdate={onUpdate} />

                    <Input
                        className="h-8 w-[150px]"
                        placeholder="Search term..."
                        value={filter.value}
                        onChange={(e) => onUpdate(filter.id, { value: sanitizeDisplay(e.target.value) })} // Sanitize input
                        aria-label="Filter search term"
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => onRemove(filter.id)}
                        title="Remove filter"
                        aria-label="Remove filter"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

function SegmentFilterPicker({ filter, onUpdate }: { filter: SegmentFilter, onUpdate: (id: string, updates: Partial<SegmentFilter>) => void }) {
    return (
        <>
            <Select
                value={filter.field}
                onValueChange={(val) => onUpdate(filter.id, { field: val })}
            >
                <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="tag">Tag</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filter.operator}
                onValueChange={(val) => onUpdate(filter.id, { operator: val as SegmentFilter['operator'] })}
            >
                <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="equals">is</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                    <SelectItem value="starts_with">starts with</SelectItem>
                </SelectContent>
            </Select>
        </>
    );
}
