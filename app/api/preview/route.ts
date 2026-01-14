import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'
import { z } from 'zod'

const previewQuerySchema = z.object({
    secret: z.string(),
    slug: z.string().optional(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function withCors(response: NextResponse) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const result = previewQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))

        if (!result.success) {
            return withCors(NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 }))
        }

        const { secret, slug } = result.data

        if (secret !== process.env.PAYLOAD_SECRET) {
            return withCors(NextResponse.json({ message: 'Invalid token' }, { status: 401 }))
        }

        const draft = await draftMode()
        draft.enable()

        const redirectUrl = slug ? `/${slug}` : '/'
        const response = NextResponse.redirect(new URL(redirectUrl, request.url))
        return withCors(response)
    } catch (error) {
        console.error('Preview GET error:', error)
        return withCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const { secret } = body

        if (secret !== process.env.PAYLOAD_SECRET) {
            return withCors(NextResponse.json({ message: 'Invalid token' }, { status: 401 }))
        }

        const draft = await draftMode()
        draft.disable()

        return withCors(NextResponse.json({ success: true }))
    } catch (error) {
        console.error('Preview POST error:', error)
        return withCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
    }
}

export async function OPTIONS() {
    return withCors(new NextResponse(null, { status: 204 }))
}
