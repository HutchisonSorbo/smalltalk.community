"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface FilterOption {
    id: string;
    label: string;
    active?: boolean;
    value?: any;
}

interface COSFilterBarProps {
    filters: FilterOption[];
    onFilterClick: (id: string) => void;
    onClearAll?: () => void;
    className?: string;
}

export function COSFilterBar({
    filters,
    onFilterClick,
    onClearAll,
    className
}: COSFilterBarProps) {
    const activeCount = filters.filter(f => f.active).length;

    return (
        <div className={cn("flex items-center space-x-2 overflow-x-auto py-1 max-w-full scrollbar-none", className)}>
            {activeCount > 0 && onClearAll && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="flex-shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
                >
                    Clear All
                </button>
            )}

            {filters.map((filter) => (
                <button
                    key={filter.id}
                    type="button"
                    onClick={() => onFilterClick(filter.id)}
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0 max-w-[200px]",
                        filter.active
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground/20 hover:text-accent-foreground"
                    )}
                >
                    <span className="truncate">{filter.label}</span>
                    <ChevronDown className="ml-1.5 h-3 w-3 opacity-50" />
                </button>
            ))}
        </div>
    );
}
