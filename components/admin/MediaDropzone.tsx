"use client"

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Upload, X, FileIcon, Image as ImageIcon, FileText, Video, Check, AlertCircle } from 'lucide-react'

interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    progress: number
    status: 'uploading' | 'complete' | 'error'
    url?: string
    error?: string
}

interface MediaDropzoneProps {
    onUploadComplete?: (files: { id: string; url: string; name: string }[]) => void
    maxFiles?: number
    accept?: string[]
    className?: string
}

function getFileIcon(type: string) {
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Video
    return FileText
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaDropzone({
    onUploadComplete,
    maxFiles = 10,
    accept = ['image/*', 'video/*', 'application/pdf'],
    className,
}: MediaDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<UploadedFile[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const uploadFile = async (file: File, id: string) => {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 200))
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id ? { ...f, progress } : f
                )
            )
        }

        // TODO: Replace with actual upload to Payload
        // const formData = new FormData()
        // formData.append('file', file)
        // const response = await fetch('/api/payload/media', { method: 'POST', body: formData })

        setFiles((prev) =>
            prev.map((f) =>
                f.id === id
                    ? { ...f, status: 'complete', url: `/media/${file.name}` }
                    : f
            )
        )
    }

    const handleFiles = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList) return

            const newFiles: UploadedFile[] = Array.from(fileList)
                .slice(0, maxFiles - files.length)
                .map((file) => ({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    progress: 0,
                    status: 'uploading' as const,
                }))

            setFiles((prev) => [...prev, ...newFiles])

            // Upload each file
            await Promise.all(
                Array.from(fileList)
                    .slice(0, maxFiles - files.length)
                    .map((file, index) =>
                        uploadFile(file, newFiles[index].id)
                    )
            )

            // Notify parent of completed uploads
            onUploadComplete?.(
                newFiles.map((f) => ({
                    id: f.id,
                    url: `/media/${f.name}`,
                    name: f.name,
                }))
            )
        },
        [files.length, maxFiles, onUploadComplete]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
        },
        [handleFiles]
    )

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id))
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept.join(',')}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                    Drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                    Images, videos, and PDFs up to 10MB each
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file) => {
                        const Icon = getFileIcon(file.type)
                        return (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                                <Icon className="h-8 w-8 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                    {file.status === 'uploading' && (
                                        <Progress
                                            value={file.progress}
                                            className="h-1 mt-2"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {file.status === 'complete' && (
                                        <Check className="h-5 w-5 text-green-500" />
                                    )}
                                    {file.status === 'error' && (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
