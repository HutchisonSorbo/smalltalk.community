import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return user profile data (excluding sensitive fields)
        return NextResponse.json({
            user: {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                profileImageUrl: dbUser.profileImageUrl,
                dateOfBirth: dbUser.dateOfBirth,
                accountType: dbUser.accountType,
                userType: dbUser.userType,
                onboardingCompleted: dbUser.onboardingCompleted,
                onboardingStep: dbUser.onboardingStep,
                profileCompletionPercentage: dbUser.profileCompletionPercentage,
                isMinor: dbUser.isMinor,
                createdAt: dbUser.createdAt,
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
