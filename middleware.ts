import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Middleware updated at: 2025-12-23T10:55:00+11:00 (Fix Login 404 on Hub)

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
    const isSmalltalk = hostname.includes("smalltalk.community") || hostname.includes("smalltalk-community");

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

    // 1. Explicit Routes: If path is explicitly /vic-band, /hub, or /volunteer-passport, let it pass
    if (path.startsWith("/vic-band") || path.startsWith("/hub") || path.startsWith("/volunteer-passport")) {
        return response;
    }

    // 2. Smalltalk/Hub Domain Logic
    if (isSmalltalk) {
        // Only rewrite to /hub if it is the ROOT path.
        // This allows other paths like /login, /dashboard to fall through to the App logic below.
        if (path === "/") {
            const newUrl = new URL("/hub", request.url);
            const rewriteResponse = NextResponse.rewrite(newUrl);
            rewriteResponse.headers.set("x-url", request.url);
            response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
            response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
            return rewriteResponse;
        }
        // If path is NOT /, we let it fall through to the default logic (Vic Band App).
        // This ensures smalltalk.community/login -> /vic-band/login (Correct)
    }

    // 3. Default Logic: Rewrite everything else to /vic-band (The App)
    // This covers:
    // - vic.band domain
    // - smalltalk.community domain (any path other than / or /hub)
    // - localhost
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
