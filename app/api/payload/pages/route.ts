import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createPageSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.record(z.unknown()), // Rich text content
    status: z.enum(['draft', 'published']).optional().default('draft'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
})

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

        const validatedData = createPageSchema.parse(body)

        const doc = await payload.create({
            collection: 'pages',
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: validatedData.content,
                status: validatedData.status,
                metaTitle: validatedData.metaTitle,
                metaDescription: validatedData.metaDescription,
            },
        })

        return NextResponse.json({ doc })
    } catch (error) {
        console.error('Failed to create page:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create page' },
            { status: 500 }
        )
    }
}
