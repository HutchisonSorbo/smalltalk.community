import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requireAdmin } from '@/lib/admin-auth'

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
        const body = await request.json()

        const doc = await payload.update({
            collection: 'pages',
            id,
            data: {
                title: body.title,
                slug: body.slug,
                content: body.content,
                status: body.status,
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
            },
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
