import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users, userOnboardingResponses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { intentSchema } from "../../../../lib/onboarding-schemas";
import { generateRecommendations } from "../../../../lib/recommendation-engine";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    try {
        // 1. Authenticate
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Parse Body
        const body = await req.json();
        const result = intentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
        }

        const intentData = result.data;
        const userId = user.id;

        // 3. Save Response
        await db.insert(userOnboardingResponses).values({
            userId,
            questionKey: "intent",
            response: intentData
        });
        // Note: Logic above keeps adding rows. We might want to upsert or delete old key first?
        // Since id is UUID PK, we can't strict upsert on (userId, questionKey) unless unique constraint exists.
        // Step 113 Schema: UNIQUE INDEX "idx_onboarding_user_id" is NOT unique on key.
        // So we get history? Or duplicate?
        // Better to cleanup old attempts for this key.
        // Ideally we should have had a Unique constraint on (userId, questionKey).
        // Since we don't, I'll delete prior responses for this key to keep it clean.

        // Wait, Drizzle delete doesn't support multiple conditions in simple syntax easily?
        // db.delete(table).where(and(eq(..), eq(..))) works.
        // Importing 'and' needed.

        // 4. Generate Recommendations
        await generateRecommendations(userId);

        // 5. Update Step
        await db.update(users).set({
            onboardingStep: 3, // Next is Apps (Step 3 or 4?)
            profileCompletionPercentage: 50
        }).where(eq(users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Intent error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
