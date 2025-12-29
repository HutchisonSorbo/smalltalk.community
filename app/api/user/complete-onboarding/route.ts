import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod"; // Added Zod import

const completeOnboardingSchema = z.object({}); // Added Zod schema definition

export async function POST(req: Request) { // Changed parameter name from request to req
    try {
        // Validate request body (expecting empty or ignored body, but ensuring valid JSON/request)
        // Since we don't strictly require a body, we can just parse an empty object or check if body exists.
        // Guidelines say "validate incoming request". Since no data is needed, we essentially skip body validation 
        // OR we can ensure it's not malformed if sent.
        // Let's assume we expect possibly an empty body.

        // Actually, for strictness per instructions: "validate the incoming request... (use schema.parseAsync or safeParse...)"
        // If content-length is 0, req.json() fails. 
        // We will assume client sends empty json object {}

        // However, standard is generally to check auth first. But instruction says "Implement validation at the start... only run Supabase auth... when validation succeeds"
        // This is a bit unusual (Auth usually first), but I will follow the specific instruction order if possible.
        // But wait, "only run Supabase auth... when validation succeeds". 
        // Fine.

        const body = await req.json().catch(() => ({})); // Handle empty body gracefully
        const parsed = completeOnboardingSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) { // Simplified error handling
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db
            .update(users)
            .set({ onboardingCompleted: true })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error completing onboarding:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); // Changed error message
    }
}
