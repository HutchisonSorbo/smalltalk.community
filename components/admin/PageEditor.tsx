"use client"

import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, ArrowLeft, Check, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic import for Lexical editor (client-only)
const RichTextEditor = dynamic(
    () => import('./LexicalEditor').then(mod => ({ default: mod.LexicalEditorComponent })),
    {
        ssr: false,
        loading: () => <div className="border rounded-lg min-h-[300px] flex items-center justify-center text-muted-foreground">Loading editor...</div>
    }
)

interface PageEditorProps {
    initialData?: {
        id?: string
        title: string
        slug: string
        content: any
        status: string
        metaTitle?: string
        metaDescription?: string
    }
    isNew?: boolean
}

export function PageEditor({ initialData, isNew = false }: PageEditorProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        content: initialData?.content || '',
        status: initialData?.status || 'draft',
        metaTitle: initialData?.metaTitle || '',
        metaDescription: initialData?.metaDescription || '',
    })

    const dirtyWhileSavingRef = useRef(false)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleTitleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            title: value,
            slug: isNew ? generateSlug(value) : prev.slug,
        }))
    }

    const handleSave = useCallback(async (isAutosave = false) => {
        if (saving) {
            dirtyWhileSavingRef.current = true
            return
        }

        setSaving(true)
        setSaveStatus('saving')
        setError(null)
        dirtyWhileSavingRef.current = false

        try {
            const endpoint = isNew
                ? '/api/payload/pages'
                : `/api/payload/pages/${initialData?.id}`

            const response = await fetch(endpoint, {
                method: isNew ? 'POST' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to save page')
            }

            const data = await response.json()
            setSaveStatus('saved')

            if (isNew) {
                router.push(`/admin/content/pages/${data.doc.id}`)
            }

            // Reset status after 2 seconds
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
            statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000)

            // If dirty while saving, trigger another save soon
            if (dirtyWhileSavingRef.current) {
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = setTimeout(() => handleSave(true), 1000)
            }
        } catch (err) {
            setSaveStatus('error')
            setError(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }, [formData, initialData?.id, isNew, saving, router])

    // Autosave with debounce
    useEffect(() => {
        if (!initialData?.id || isNew) return // Don't autosave new pages

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
            handleSave(true)
        }, 3000)

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        }
    }, [formData, initialData?.id, isNew, handleSave])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
        }
    }, [])

    return (
        <div className="flex-1 space-y-4 pt-2 max-w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/content/pages">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isNew ? 'New Page' : 'Edit Page'}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Autosave Indicator */}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        {saveStatus === 'saving' && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving...
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <Check className="h-3 w-3 text-green-500" />
                                Saved
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                Error
                            </>
                        )}
                    </span>
                    <Button onClick={() => handleSave(false)} disabled={saving}>
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Page title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">/</span>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="page-slug"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <RichTextEditor
                                    value={typeof formData.content === 'string' ? formData.content : ''}
                                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                    placeholder="Start writing your page content..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO</CardTitle>
                            <CardDescription>
                                Search engine optimization
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    placeholder="SEO title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    placeholder="SEO description"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
