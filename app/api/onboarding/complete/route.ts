import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = user.id;

        // Finalize Onboarding
        await db.update(users).set({
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
            profileCompletionPercentage: 100,
            onboardingStep: 6 // Completed
        }).where(eq(users.id, userId));

        // TODO: Trigger Email Welcome (e.g., via Supabase Edge Function or external service)

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Complete Onboarding error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
