"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, Tag, Mail, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface BulkActionsBarProps {
    selectedCount: number;
    onClear: () => void;
    onDelete?: () => void;
    onTag?: () => void;
    onEmail?: () => void;
    onExport?: () => void;
    className?: string;
}

export function BulkActionsBar({
    selectedCount,
    onClear,
    onDelete,
    onTag,
    onEmail,
    onExport,
    className
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={cn(
                    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-foreground text-background rounded-full shadow-2xl border border-border/10",
                    className
                )}
            >
                <div className="flex items-center pl-4 pr-2 gap-3 border-r border-background/20">
                    <span className="font-semibold text-sm whitespace-nowrap">{selectedCount} selected</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        onClick={onClear}
                        aria-label="Clear selection"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 pr-1">
                    {onTag && (
                        <Button variant="ghost" size="sm" onClick={onTag} className="hover:bg-background/20 text-background h-8 px-2.5 rounded-full">
                            <Tag className="h-4 w-4 mr-2" /> Tag
                        </Button>
                    )}
                    {onEmail && (
                        <Button variant="ghost" size="sm" onClick={onEmail} className="hover:bg-background/20 text-background h-8 px-2.5 rounded-full">
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="ghost" size="sm" onClick={onExport} className="hover:bg-background/20 text-background h-8 px-2.5 rounded-full">
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="sm" onClick={onDelete} className="hover:bg-red-500/20 text-red-300 hover:text-red-200 h-8 px-2.5 rounded-full">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
