"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        <div className={cn("w-full flex items-center space-x-2 overflow-x-auto no-scrollbar py-1", className)}>
            {activeCount > 0 && onClearAll && (
                <button
                    onClick={onClearAll}
                    className="flex-shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
                >
                    Clear All
                </button>
            )}

            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterClick(filter.id)}
                    className={cn(
                        "flex-shrink-0 inline-flex items-center h-8 px-3.5 rounded-full text-xs font-medium transition-all border select-none",
                        filter.active
                            ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
                            : "bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground/20 hover:text-accent-foreground"
                    )}
                >
                    {filter.label}
                    {filter.active ? (
                        <X className="ml-1.5 h-3 w-3 opacity-70" />
                    ) : (
                        <ChevronDown className="ml-1.5 h-3 w-3 opacity-50" />
                    )}
                </button>
            ))}
        </div>
    );
}
