"use client"

import { useState, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bold, Italic, Heading2, List, Link as LinkIcon, Code } from 'lucide-react'

interface RichTextEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
}

export function LexicalEditorComponent({
    value = '',
    onChange,
    placeholder = 'Start writing...',
    className,
}: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const insertMarkdown = useCallback((prefix: string, suffix?: string) => {
        const actualSuffix = suffix ?? prefix
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end)

        onChange?.(newText)

        // Restore cursor position after the inserted text
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            )
        }, 0)
    }, [value, onChange])

    const formatBold = () => insertMarkdown('**')
    const formatItalic = () => insertMarkdown('*')
    const formatHeading = () => insertMarkdown('\n## ', '\n')
    const formatList = () => insertMarkdown('\n- ', '')
    const formatCode = () => insertMarkdown('`')
    const formatLink = () => insertMarkdown('[', '](url)')

    return (
        <div className={cn('border rounded-lg overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b p-2 bg-muted/30">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatBold}
                    title="Bold (Ctrl+B)"
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatItalic}
                    title="Italic (Ctrl+I)"
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatHeading}
                    title="Heading"
                    aria-label="Heading"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatList}
                    title="Bullet List"
                    aria-label="Bullet list"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatCode}
                    title="Inline Code"
                    aria-label="Inline code"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatLink}
                    title="Link"
                    aria-label="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                    Supports Markdown
                </span>
            </div>

            {/* Editor */}
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm"
            />
        </div>
    )
}
