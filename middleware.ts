import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Middleware updated at: 2025-12-23T10:35:00+11:00 (Renamed /marketing to /hub)

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
    // CRITICAL: This includes the Vercel subdomain "smalltalk-community"
    const isSmalltalk = hostname === "smalltalk.community" || hostname.includes("smalltalk-community");
    
    const url = request.nextUrl;
    const path = url.pathname;

    // Skip Next.js internals, static files, and Sentry monitoring
    if (path.startsWith("/_next") || path.startsWith("/api") || path.startsWith("/cms") || path === "/monitoring" || path.includes(".")) {
        return response;
    }

    // Auth Protection (Legacy/VicBand)
    if (path.startsWith("/dashboard") && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (path === "/login" && user) {
        const next = request.nextUrl.searchParams.get("next");
        return NextResponse.redirect(new URL(next || "/dashboard", request.url));
    }

    // Rewrite Logic
    // If the path is ALREADY starting with /vic-band or /hub, do nothing (avoid infinite loop)
    if (path.startsWith("/vic-band") || path.startsWith("/hub")) {
        return response;
    }

    if (isSmalltalk) {
        // Rewrite to /hub (The Hub) - formerly /marketing
        const newUrl = new URL(`/hub${path === "/" ? "" : path}`, request.url);
        const rewriteResponse = NextResponse.rewrite(newUrl);
        // Copy cookies and headers
        rewriteResponse.headers.set("x-url", request.url);
        response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
        response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
        return rewriteResponse;
    }

    // Default: Rewrite to /vic-band (The App)
    // This covers vic.band, vic-band.vercel.app, localhost, etc.
    const newUrl = new URL(`/vic-band${path === "/" ? "" : path}`, request.url);
    const rewriteResponse = NextResponse.rewrite(newUrl);

    response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
    response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
    return rewriteResponse;
    
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
