"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, Tag, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CRMBulkAction, CRMBulkActionsProps } from "@/types/crm";

// Re-export types for backwards compatibility
export type { CRMBulkAction, CRMBulkActionsProps };

export function CRMBulkActions({ selectedCount, onClear, onAction }: CRMBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-4 rounded-full border bg-background/95 p-2 pr-4 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-r pr-4 pl-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={onClear}
                        aria-label="Clear selection"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-bold">
                        {selectedCount} Selected
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:text-primary transition-colors"
                        onClick={() => onAction("email")}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:text-primary transition-colors"
                        onClick={() => onAction("tag")}
                    >
                        <Tag className="mr-2 h-4 w-4" />
                        Tag
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:text-primary transition-colors"
                        onClick={() => onAction("archive")}
                    >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => onAction("delete")}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}
