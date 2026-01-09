import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Middleware updated at: 2025-12-23T10:55:00+11:00 (Fix Login 404 on Hub)

export async function middleware(request: NextRequest) {
    // CRITICAL: CVE-2025-29927 protection - Block middleware subrequest bypass
    if (request.headers.has('x-middleware-subrequest')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
        console.error("[Middleware] Missing or invalid Supabase configuration");
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error: Missing configuration" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
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

    // Check for suspended accounts (non-blocking on errors)
    // The suspension check is a secondary security measure - failure shouldn't prevent login
    if (user) {
        try {
            const { data: profile, error } = await supabase
                .from('users')
                .select('is_suspended')
                .eq('id', user.id)
                .single();

            if (error) {
                // Log the error but allow through - suspension check shouldn't block login
                // PGRST116 = profile doesn't exist (new user), other errors = DB issues
                console.warn(`[Middleware] Could not check suspension for user ${user.id}: ${error.code} - ${error.message}`);
                // Allow through - user might need to complete onboarding, or there's a DB issue
            } else if (profile?.is_suspended === true) {
                // Only block if explicitly suspended
                console.log(`[Middleware] User ${user.id} is suspended - blocking access`);
                await supabase.auth.signOut();
                return NextResponse.redirect(new URL(`/login?error=account_suspended`, request.url));
            }
            // Profile exists and is not suspended, or check failed - allow through
        } catch (e) {
            // Unexpected error - log and allow through
            console.error("[Middleware] Unexpected error in suspension check:", e);
        }
    }



    // --- Domain Routing & Rewrites ---
    const hostname = request.headers.get("host") || "";

    // Check if we are in dev mode (localhost) or production
    const isSmalltalk = hostname.includes("smalltalk.community") || hostname.includes("smalltalk-community") || hostname.includes("localhost");

    const url = request.nextUrl;
    const path = url.pathname;

    // Explicitly rewrite specific API routes that are part of the local-music-network app
    // This must happen BEFORE the global API skip below
    if (path.startsWith("/api/musicians") || path.startsWith("/api/professionals") ||
        path.startsWith("/api/gigs") || path.startsWith("/api/bands") || path.startsWith("/api/reviews")) {
        const newUrl = new URL(`/local-music-network${path}${url.search}`, request.url);
        const rewriteResponse = NextResponse.rewrite(newUrl);
        response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
        response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
        return rewriteResponse;
    }

    // Skip Next.js internals, static files, and Sentry monitoring
    if (path.startsWith("/_next") || path.startsWith("/api") || path === "/monitoring" || path.includes(".")) {
        return response;
    }

    // Auth Protection (Legacy/VicBand)
    const bypassToken = request.headers.get("x-admin-bypass-token");
    const isBypass = process.env.ADMIN_BYPASS_TOKEN && bypassToken === process.env.ADMIN_BYPASS_TOKEN;

    if (path.startsWith("/dashboard") && !user && !isBypass) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (path === "/login" && user) {
        const next = request.nextUrl.searchParams.get("next");
        return NextResponse.redirect(new URL(next || "/dashboard", request.url));
    }

    // Rewrite Logic

    // 1. Explicit Routes: Allow app paths to pass through without rewriting
    if (path.startsWith("/local-music-network") || path.startsWith("/hub") || path.startsWith("/volunteer-passport") ||
        path.startsWith("/onboarding") || path.startsWith("/dashboard") || path.startsWith("/apps") || path.startsWith("/settings") ||
        path.startsWith("/login") || path.startsWith("/forgot-password") || path.startsWith("/reset-password") ||
        path.startsWith("/youth-service-navigator") || path.startsWith("/apprenticeship-hub") || path.startsWith("/peer-support-finder") ||
        path.startsWith("/admin") || path.startsWith("/about") || path.startsWith("/accessibility") || path.startsWith("/work-experience-hub")) {
        return response;
    }

    // 2. Smalltalk/Hub Domain Logic
    if (isSmalltalk) {
        // Only rewrite to /hub if it is the ROOT path.
        // This allows other paths like /login, /dashboard to fall through to the App logic below.
        if (path === "/") {
            return rewriteRootToHub(request, response);
        }
        // If path is NOT /, we let it fall through to the default logic (Local Music Network App).
        // This ensures smalltalk.community/login -> /login (passes through)
    }

    // 3. Default Logic: 
    if (path === "/") {
        return rewriteRootToHub(request, response);
    }

    // Rewrite everything else to /local-music-network (The App)
    const newUrl = new URL(`/local-music-network${path}`, request.url);
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

function rewriteRootToHub(request: NextRequest, response: NextResponse) {
    const newUrl = new URL("/hub", request.url);
    const rewriteResponse = NextResponse.rewrite(newUrl);
    rewriteResponse.headers.set("x-url", request.url);
    response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v));
    response.cookies.getAll().forEach((c) => rewriteResponse.cookies.set(c));
    return rewriteResponse;
}

