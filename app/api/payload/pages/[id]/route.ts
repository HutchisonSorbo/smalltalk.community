import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const pageUpdateSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(100).regex(/^[a-z0-7-]+$/).optional(),
    content: z.any().optional(),
    status: z.enum(['draft', 'published']).optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single page
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin()
        const { id } = await params
        const payload = await getPayload({ config })

        const page = await payload.findByID({
            collection: 'pages',
            id,
        })

        return NextResponse.json({ doc: page })
    } catch (error) {
        console.error('Failed to fetch page:', error)
        return NextResponse.json(
            { error: 'Failed to fetch page' },
            { status: 500 }
        )
    }
}

// PATCH update page
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin()
        const { id } = await params
        const payload = await getPayload({ config })
        const json = await request.json()

        const result = pageUpdateSchema.safeParse(json)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            )
        }

        const sanitizedData = result.data

        const doc = await payload.update({
            collection: 'pages',
            id,
            data: sanitizedData,
        })

        return NextResponse.json({ doc })
    } catch (error) {
        console.error('Failed to update page:', error)
        return NextResponse.json(
            { error: 'Failed to update page' },
            { status: 500 }
        )
    }
}

// DELETE page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin()
        const { id } = await params
        const payload = await getPayload({ config })

        await payload.delete({
            collection: 'pages',
            id,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete page:', error)
        return NextResponse.json(
            { error: 'Failed to delete page' },
            { status: 500 }
        )
    }
}
