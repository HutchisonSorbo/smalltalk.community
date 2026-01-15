import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageEditor } from '@/components/admin/PageEditor'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditPagePage({ params }: PageProps) {
    const { id } = await params
    const payload = await getPayload({ config })

    try {
        const page = await payload.findByID({
            collection: 'pages',
            id,
        })

        if (!page) {
            notFound()
        }

        return (
            <PageEditor
                initialData={{
                    id: String(page.id),
                    title: page.title,
                    slug: page.slug,
                    content: page.content,
                    status: page.status,
                    metaTitle: page.metaTitle,
                    metaDescription: page.metaDescription,
                }}
            />
        )
    } catch {
        notFound()
    }
}
