import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Edit, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ContentPagesPage() {
    const payload = await getPayload({ config })

    let pages: any = { docs: [], totalDocs: 0 };
    let error = null;

    try {
        pages = await payload.find({
            collection: 'pages',
            limit: 50,
            sort: '-updatedAt',
        });
    } catch (err) {
        console.error("Failed to fetch pages:", err);
        error = err;
    }

    return (
        <div className="flex-1 space-y-4 pt-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pages</h2>
                    <p className="text-muted-foreground">
                        Manage website pages and content
                    </p>
                </div>

                {error != null && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading pages</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>There was a problem connecting to the CMS. Please try again later.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Button asChild>
                    <Link href="/admin/content/pages/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Page
                    </Link>
                </Button>
            </div>

            {pages.docs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No pages yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first page to get started
                        </p>
                        <Button asChild>
                            <Link href="/admin/content/pages/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Page
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Pages</CardTitle>
                        <CardDescription>
                            {pages.totalDocs} page{pages.totalDocs !== 1 ? 's' : ''} total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {pages.docs.map((page: any) => (
                                <div
                                    key={page.id}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{page.title}</span>
                                                <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                                                    {page.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                /{page.slug} • Updated {formatDistanceToNow(new Date(page.updatedAt))} ago
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/${page.slug}`} target="_blank">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/content/pages/${page.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
