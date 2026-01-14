import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { users, userOnboardingResponses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const situationSchema = z.object({
    currentSituation: z.enum([
        "student_school",
        "student_tertiary",
        "working",
        "looking_for_work",
        "taking_a_break",
        "other"
    ]),
});

export async function POST(request: Request) {
    try {
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

        const body = await request.json();
        const parsed = situationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { currentSituation } = parsed.data;

        // Store situation in userOnboardingResponses
        await db
            .insert(userOnboardingResponses)
            .values({
                userId: user.id,
                questionKey: "current_situation",
                response: { situation: currentSituation },
            })
            .onConflictDoNothing();

        // Update onboarding step 
        await db
            .update(users)
            .set({
                onboardingStep: 5, // After situation
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving situation:", error);
        return NextResponse.json(
            { error: "Failed to save situation" },
            { status: 500 }
        );
    }
}
