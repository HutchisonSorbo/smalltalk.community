"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { COSCard } from "./cos-card";
import { COSBadge } from "./cos-badge";
import { MoreHorizontal, Plus } from "lucide-react";

interface KanbanItem {
    id: string;
    title: string;
    subtitle?: string;
    status: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    assignee?: {
        name: string;
        avatar?: string;
    };
}

interface COSKanbanProps {
    columns: Array<{ id: string; title: string }>;
    items: KanbanItem[];
    onMove: (itemId: string, newStatus: string) => void;
    onItemClick?: (item: KanbanItem) => void;
    onAddClick?: (status: string) => void;
    className?: string;
}

const COSKanbanCard = ({
    item,
    onClick
}: {
    item: KanbanItem;
    onClick?: (item: KanbanItem) => void;
}) => (
    <COSCard
        variant="default"
        interactive
        onClick={() => onClick?.(item)}
        className="p-4 border-l-4"
        style={{
            borderLeftColor: item.priority === 'high' ? 'hsl(var(--destructive))' :
                item.priority === 'medium' ? 'hsl(var(--warning))' :
                    'hsl(var(--primary))'
        }}
    >
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 min-w-0">
                <h4 className="text-sm font-semibold leading-tight truncate">{item.title}</h4>
                {item.priority === 'high' && (
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse flex-shrink-0" />
                )}
            </div>

            {item.subtitle && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.subtitle}
                </p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags?.map((tag) => (
                    <COSBadge key={tag} size="sm" variant="info" className="opacity-80">
                        {tag}
                    </COSBadge>
                ))}
            </div>

            {item.assignee && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50 min-w-0">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {item.assignee.name.charAt(0)}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                        {item.assignee.name}
                    </span>
                </div>
            )}
        </div>
    </COSCard>
);

const COSKanbanColumn = ({
    column,
    columnItems,
    onAddClick,
    onItemClick
}: {
    column: { id: string; title: string };
    columnItems: KanbanItem[];
    onAddClick?: (status: string) => void;
    onItemClick?: (item: KanbanItem) => void;
}) => (
    <div
        className="flex-shrink-0 w-full md:w-80 flex flex-col gap-4 bg-muted/30 p-4 rounded-2xl border"
    >
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-sm tracking-tight truncate">{column.title}</h3>
                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                    {columnItems.length}
                </span>
            </div>
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => onAddClick?.(column.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={`Add item to ${column.title}`}
                >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                    type="button"
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={`Column options for ${column.title}`}
                >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-3 min-h-[100px]">
            {columnItems.map((item) => (
                <COSKanbanCard
                    key={item.id}
                    item={item}
                    onClick={onItemClick}
                />
            ))}

            {columnItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl border-muted/30">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        Empty Column
                    </p>
                </div>
            )}
        </div>
    </div>
);

const COSKanban = ({ columns, items, onMove, onItemClick, onAddClick, className }: COSKanbanProps) => {
    return (
        <div className={cn("flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-full max-w-full", className)}>
            {columns.map((column) => {
                const columnItems = items.filter((item) => item.status === column.id);

                return (
                    <COSKanbanColumn
                        key={column.id}
                        column={column}
                        columnItems={columnItems}
                        onAddClick={onAddClick}
                        onItemClick={onItemClick}
                    />
                );
            })}
        </div>
    );
};

export { COSKanban };
