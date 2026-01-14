import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { users, userOnboardingResponses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const interestsSchema = z.object({
    interests: z.array(z.string()),
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
        const parsed = interestsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { interests } = parsed.data;

        // Store interests in userOnboardingResponses
        await db
            .insert(userOnboardingResponses)
            .values({
                userId: user.id,
                questionKey: "interests",
                response: interests,
            })
            .onConflictDoNothing();

        // Update onboarding step 
        await db
            .update(users)
            .set({
                onboardingStep: 4, // After interests
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving interests:", error);
        return NextResponse.json(
            { error: "Failed to save interests" },
            { status: 500 }
        );
    }
}
