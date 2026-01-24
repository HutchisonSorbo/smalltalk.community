import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { insertAuditLog } from "@/lib/audit/auditLog";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

// Called when user clicks "Get Started" on welcome screen
export async function POST(req: Request) {
    try {
        const schema = z.object({}).strict();
        
        let body = {};
        const contentLength = req.headers.get("content-length");

        if (contentLength && parseInt(contentLength) > 0) {
            try {
                body = await req.json();
            } catch {
                return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
            }
        }

        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Unexpected request body" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }: any) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Server component context
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Set onboarding step to 1 (entering profile setup)
        await db
            .update(users)
            .set({
                onboardingStep: 1,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        
        // Log audit event
        await insertAuditLog({
            eventType: 'system',
            severity: 'info',
            message: 'User started onboarding',
            userId: user.id,
        });

        return NextResponse.json({ success: true, step: 1 });
    } catch (error) {
        console.error("Error starting onboarding:", error);
        return NextResponse.json(
            { error: "Failed to start onboarding" },
            { status: 500 }
        );
    }
}
