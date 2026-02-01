"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SegmentFilter {
    id: string;
    field: string;
    operator: 'equals' | 'contains' | 'in';
    value: any;
}

interface SegmentBuilderProps {
    filters: SegmentFilter[];
    onAddFilter: (filter: SegmentFilter) => void;
    onRemoveFilter: (id: string) => void;
    onClearAll: () => void;
    className?: string;
}

const AVAILABLE_FIELDS = [
    { label: "Status", value: "status" },
    { label: "Tags", value: "tags" },
    { label: "Source", value: "source" },
    { label: "Company", value: "company" },
];

export function SegmentBuilder({
    filters,
    onAddFilter,
    onRemoveFilter,
    onClearAll,
    className
}: SegmentBuilderProps) {
    const [open, setOpen] = React.useState(false);

    // Convert definitions to UI options for the generic bar if needed
    // But for now we use custom badge rendering for complex segment logic

    const handleSelectField = (field: string) => {
        // Determine default operator/value based on field type (mock logic)
        const newFilter: SegmentFilter = {
            id: crypto.randomUUID(),
            field,
            operator: 'equals',
            value: ''
        };
        onAddFilter(newFilter);
        setOpen(false);
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 flex-wrap">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                            <CommandList>
                                <CommandGroup heading="Filter by...">
                                    {AVAILABLE_FIELDS.map(f => (
                                        <CommandItem
                                            key={f.value}
                                            onSelect={() => handleSelectField(f.value)}
                                        >
                                            {f.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {filters.length > 0 && (
                    <>
                        <div className="h-4 w-px bg-border mx-1" />

                        {filters.map(filter => (
                            <Badge key={filter.id} variant="secondary" className="h-8 px-2 lg:px-3 text-sm font-normal gap-1">
                                <span className="font-medium">{AVAILABLE_FIELDS.find(f => f.value === filter.field)?.label}:</span>
                                <span className="max-w-[150px] truncate block" title={filter.value}>
                                    {filter.value || "(Any)"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveFilter(filter.id)}
                                    title="Remove filter"
                                    aria-label={`Remove filter: ${filter.field}`}
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearAll}
                            className="h-8 px-2 text-xs"
                        >
                            Clear all
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
