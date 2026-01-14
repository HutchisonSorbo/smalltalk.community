"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SplitSquareVertical, X, ExternalLink, Maximize2 } from 'lucide-react'

interface LivePreviewPanelProps {
    pageSlug: string
    isOpen: boolean
    onToggle: () => void
}

export function LivePreviewPanel({ pageSlug, isOpen, onToggle }: LivePreviewPanelProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const previewUrl = `/${pageSlug}?preview=true`

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="fixed bottom-4 right-4 z-40"
            >
                <SplitSquareVertical className="h-4 w-4 mr-2" />
                Live Preview
            </Button>
        )
    }

    return (
        <div
            className={cn(
                'fixed bg-background border-l shadow-lg z-50 flex flex-col',
                isFullscreen
                    ? 'inset-0'
                    : 'right-0 top-0 bottom-0 w-1/2'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <SplitSquareVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Live Preview</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(previewUrl, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 bg-white">
                <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Page Preview"
                />
            </div>
        </div>
    )
}
