"use client"

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
    selectedCount: number
    onPublish: () => void
    onUnpublish: () => void
    onDelete: () => void
    onClearSelection: () => void
    isProcessing?: boolean
}

/**
 * Bulk actions bar for performing operations on multiple selected items.
 * 
 * @param props.selectedCount - Number of currently selected items
 * @param props.onPublish - Callback to publish selected items
 * @param props.onUnpublish - Callback to unpublish selected items
 * @param props.onDelete - Callback to delete selected items
 * @param props.onClearSelection - Callback to clear current selection
 * @param props.isProcessing - Optional flag indicating if an operation is in progress
 * @returns A fixed position bar with action buttons, or null if nothing is selected
 */
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
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
            <div
                className="bg-background border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4 max-w-full overflow-x-auto pointer-events-auto"
                role="toolbar"
                aria-label="Bulk actions"
            >
                <span className="text-sm font-medium whitespace-nowrap">
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </span>
                <div className="h-4 w-px bg-border shrink-0" />
                <div className="flex items-center gap-2 shrink-0">
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
                <div className="h-4 w-px bg-border shrink-0" />
                <Button variant="ghost" size="sm" onClick={onClearSelection} className="whitespace-nowrap shrink-0">
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
    ariaLabel?: string
}

/**
 * A wrapper for table/list rows that adds a selection checkbox.
 * 
 * @param props.id - Unique identifier for the row
 * @param props.selected - Whether the row is currently selected
 * @param props.onSelect - Callback triggered when selection state changes
 * @param props.children - Row content
 * @param props.className - Optional extra CSS classes
 * @param props.ariaLabel - Optional accessible label for the checkbox
 * @returns A container with a checkbox and the provided children
 */
export function SelectableRow({
    id,
    selected,
    onSelect,
    children,
    className,
    ariaLabel,
}: SelectableRowProps) {
    const labelId = ariaLabel ? undefined : `${id}-label`

    return (
        <div className={cn('flex items-center gap-4', className)}>
            <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(id, !!checked)}
                aria-label={ariaLabel}
                aria-labelledby={labelId}
            />
            <div id={labelId} className="flex-1">{children}</div>
        </div>
    )
}
