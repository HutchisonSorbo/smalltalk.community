import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // --- Domain Routing & Rewrites ---
    const hostname = request.headers.get("host") || "";
    // Check if we are in dev mode (localhost) or production
    const isSmalltalk = hostname === "smalltalk.community";
    
    // We treat EVERYTHING else as VicBand by default.
    // This covers vic.band, www.vic.band, localhost, and all *.vercel.app preview URLs.
    
    const url = request.nextUrl;
    const path = url.pathname;

    // Skip Next.js internals, static files, and Sentry monitoring
    // Added /monitoring to exclusion list
    if (path.startsWith("/_next") || path.startsWith("/api") || path.startsWith("/cms") || path === "/monitoring" || path.includes(".")) {
        return response;
    }

    // Auth Protection (Legacy/VicBand)
    // We check the original path.
    if (path.startsWith("/dashboard") && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (path === "/login" && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Rewrite Logic
    // If the path is ALREADY starting with /vic-band or /marketing, do nothing (avoid infinite loop)
    if (path.startsWith("/vic-band") || path.startsWith("/marketing")) {
        return response;
    }

    if (isSmalltalk) {
        // Rewrite to /marketing
        const newUrl = new URL(`/marketing${path === "/" ? "" : path}`, request.url);
        const rewriteResponse = NextResponse.rewrite(newUrl);
        // Copy cookies from Supabase response to Rewrite response
        rewriteResponse.headers.set("x-url", request.url);
        response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
        response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
        return rewriteResponse;
    }

    // Default: Rewrite to /vic-band (for vic.band, localhost, vercel.app, etc.)
    const newUrl = new URL(`/vic-band${path === "/" ? "" : path}`, request.url);
    const rewriteResponse = NextResponse.rewrite(newUrl);

    response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
    response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
    return rewriteResponse;
    
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * - api/ (API routes)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
