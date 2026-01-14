"use client"

import { MediaDropzone } from '@/components/admin/MediaDropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MediaUploadPage() {
    const handleUploadComplete = (files: { id: string; url: string; name: string }[]) => {
        console.log('Uploaded files:', files)
        // TODO: Redirect to media library after upload
    }

    return (
        <div className="flex-1 space-y-4 pt-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/content/media">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Upload Media</h2>
                    <p className="text-muted-foreground">
                        Upload images, videos, and documents
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>
                        Drag and drop files or click to browse
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaDropzone onUploadComplete={handleUploadComplete} />
                </CardContent>
            </Card>
        </div>
    )
}
