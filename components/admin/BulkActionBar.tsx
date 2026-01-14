"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Eye, EyeOff, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
    selectedCount: number
    onPublish: () => void
    onUnpublish: () => void
    onDelete: () => void
    onClearSelection: () => void
    isProcessing?: boolean
}

export function BulkActionBar({
    selectedCount,
    onPublish,
    onUnpublish,
    onDelete,
    onClearSelection,
    isProcessing = false,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-background border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
                <span className="text-sm font-medium">
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </span>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPublish}
                        disabled={isProcessing}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Publish
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onUnpublish}
                        disabled={isProcessing}
                    >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Unpublish
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        disabled={isProcessing}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
                <div className="h-4 w-px bg-border" />
                <Button variant="ghost" size="sm" onClick={onClearSelection}>
                    Clear
                </Button>
            </div>
        </div>
    )
}

interface SelectableRowProps {
    id: string
    selected: boolean
    onSelect: (id: string, selected: boolean) => void
    children: React.ReactNode
    className?: string
}

export function SelectableRow({
    id,
    selected,
    onSelect,
    children,
    className,
}: SelectableRowProps) {
    return (
        <div className={cn('flex items-center gap-4', className)}>
            <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(id, !!checked)}
            />
            <div className="flex-1">{children}</div>
        </div>
    )
}
