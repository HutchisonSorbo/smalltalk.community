import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const slug = searchParams.get('slug')

    // Check the secret and next parameters
    // This secret should only be known to this API route and the CMS
    if (secret !== process.env.PAYLOAD_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Enable Draft Mode by setting the cookie
    const draft = await draftMode()
    draft.enable()

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    const redirectUrl = slug ? `/${slug}` : '/'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
}

export async function POST(request: NextRequest) {
    // Disable draft mode
    const draft = await draftMode()
    draft.disable()

    return NextResponse.json({ success: true })
}
