import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// GET all pages
export async function GET() {
    try {
        await requireAdmin()
        const payload = await getPayload({ config })

        const pages = await payload.find({
            collection: 'pages',
            limit: 100,
            sort: '-updatedAt',
        })

        return NextResponse.json(pages)
    } catch (error) {
        console.error('Failed to fetch pages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pages' },
            { status: 500 }
        )
    }
}

// POST create new page
export async function POST(request: NextRequest) {
    try {
        await requireAdmin()
        const payload = await getPayload({ config })
        const body = await request.json()

        const doc = await payload.create({
            collection: 'pages',
            data: {
                title: body.title,
                slug: body.slug,
                content: body.content,
                status: body.status || 'draft',
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
            },
        })

        return NextResponse.json({ doc })
    } catch (error) {
        console.error('Failed to create page:', error)
        return NextResponse.json(
            { error: 'Failed to create page' },
            { status: 500 }
        )
    }
}
