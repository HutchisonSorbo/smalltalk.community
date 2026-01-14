import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Image as ImageIcon, FileText, Video } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

function getMediaIcon(mimeType: string) {
    if (mimeType?.startsWith('image/')) return ImageIcon
    if (mimeType?.startsWith('video/')) return Video
    return FileText
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function MediaLibraryPage() {
    const payload = await getPayload({ config })

    const media = await payload.find({
        collection: 'media',
        limit: 50,
        sort: '-createdAt',
    })

    return (
        <div className="flex-1 space-y-4 pt-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
                    <p className="text-muted-foreground">
                        Upload and manage images, videos, and documents
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/content/media/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                    </Link>
                </Button>
            </div>

            {media.docs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No media yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Upload your first file to get started
                        </p>
                        <Button asChild>
                            <Link href="/admin/content/media/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Files
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Media</CardTitle>
                        <CardDescription>
                            {media.totalDocs} file{media.totalDocs !== 1 ? 's' : ''} total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {media.docs.map((item: any) => {
                                const Icon = getMediaIcon(item.mimeType)
                                const isImage = item.mimeType?.startsWith('image/')

                                return (
                                    <div
                                        key={item.id}
                                        className="group relative aspect-square rounded-lg border bg-muted overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                                    >
                                        {isImage && item.url ? (
                                            <img
                                                src={item.url}
                                                alt={item.alt || ''}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Icon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                            <p className="text-white text-xs text-center truncate w-full">
                                                {item.filename}
                                            </p>
                                            {item.filesize && (
                                                <p className="text-white/70 text-xs">
                                                    {formatFileSize(item.filesize)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
