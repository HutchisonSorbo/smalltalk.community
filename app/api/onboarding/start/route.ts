import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Called when user clicks "Get Started" on welcome screen
export async function POST() {
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
                            cookiesToSet.forEach(({ name, value, options }) =>
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

        return NextResponse.json({ success: true, step: 1 });
    } catch (error) {
        console.error("Error starting onboarding:", error);
        return NextResponse.json(
            { error: "Failed to start onboarding" },
            { status: 500 }
        );
    }
}
