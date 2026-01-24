import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RotateCcw, Eye, GitCompare } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface VersionsPageProps {
    params: Promise<{ id: string }>
}

export default async function VersionsPage({ params }: VersionsPageProps) {
    const { id } = await params
    const payload = await getPayload({ config })

    try {
        // Get the page with its versions
        const page = await payload.findByID({
            collection: 'pages',
            id,
        })

        if (!page) {
            notFound()
        }

        // Get version history
        const versions = await payload.findVersions({
            collection: 'pages',
            where: {
                parent: { equals: id },
            },
            sort: '-updatedAt',
            limit: 20,
        })

        return (
            <div className="flex-1 space-y-4 pt-2 max-w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/content/pages/${id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Editor
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold tracking-tight">Version History</h2>
                            <p className="text-muted-foreground truncate max-w-full">{page.title}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Versions</CardTitle>
                        <CardDescription>
                            {versions.totalDocs} version{versions.totalDocs !== 1 ? 's' : ''} saved
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {versions.docs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No previous versions available
                            </p>
                        ) : (
                            <div className="divide-y">
                                {versions.docs.map((version: any, index: number) => (
                                    <div
                                        key={(version as any).meta?.id || version.id}
                                        className="flex items-center justify-between py-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    Version {versions.totalDocs - index}
                                                </span>
                                                {index === 0 && (
                                                    <Badge variant="secondary">Latest</Badge>
                                                )}
                                                {version.version?.status === 'published' && (
                                                    <Badge>Published</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date((version as any).meta?.updatedAt || version.updatedAt), 'PPpp')} •{' '}
                                                {formatDistanceToNow(new Date((version as any).meta?.updatedAt || version.updatedAt))} ago
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" disabled>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Preview
                                            </Button>
                                            <Button variant="ghost" size="sm" disabled>
                                                <GitCompare className="h-4 w-4 mr-1" />
                                                Compare
                                            </Button>
                                            <Button variant="outline" size="sm" disabled>
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    } catch {
        notFound()
    }
}
