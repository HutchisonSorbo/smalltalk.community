import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod"; // Added Zod import

const completeOnboardingSchema = z.object({}); // Added Zod schema definition

export async function POST(req: Request) {
    try {
        // Validate request: body is optionally an empty JSON object. 
        // Validation runs before auth to catch malformed requests early.
        const body = await req.json().catch(() => ({}));
        const parsed = completeOnboardingSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db
            .update(users)
            .set({
                onboardingCompleted: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error completing onboarding:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
