import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'
import { insertAuditLog } from '@/lib/audit/auditLog'

export const dynamic = 'force-dynamic'

const createPageSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.record(z.unknown()), // Rich text content
    status: z.enum(['draft', 'published']).optional().default('draft'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
})

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

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
        const user = await requireAdmin()
        const payload = await getPayload({ config })
        const body = await request.json()

        const validatedData = createPageSchema.parse(body)

        // TODO: Implement thorough Lexical content sanitization here.
        // For now, we trust Lexical's internal structure but logging this step.
        const sanitizedContent = validatedData.content; 

        const doc = await payload.create({
            collection: 'pages',
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: sanitizedContent,
                status: validatedData.status,
                metaTitle: validatedData.metaTitle,
                metaDescription: validatedData.metaDescription,
            },
        })

        // Audit Log
        await insertAuditLog({
            eventType: 'system',
            severity: 'info',
            message: `Page created: ${doc.title}`,
            userId: user.id,
            safeQueryParams: { pageId: doc.id, slug: doc.slug }
        });

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
