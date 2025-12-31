import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import {
    users,
    musicianProfiles,
    professionalProfiles,
    organisations,
    organisationMembers,
    userOnboardingResponses
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { profileSetupSchema } from "../../../../lib/onboarding-schemas";

// Use service role for database updates that might require admin privilegies or bypassing RLS if needed (though we use Drizzle so we bypass RLS mostly unless using Postgres directly via Supabase client)
// We use Drizzle for DB, so we don't need Supabase Sudo client strictly, but we need to verify the user from the Request headers/Supabase token.
// Actually, in App Router, we should use createServerClient from @supabase/ssr usually.
// But we are sticking to simple verification for now or assuming middleware passed user.
// Let's use the Authorization header to verify the user using basic supabase client.

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    try {
        // 1. Authenticate
        // We can get the session from headers if we forward them, or just use the token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const result = profileSetupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
        }

        const profileData = result.data;
        const userId = user.id;

        // 3. Get User Details (to decide table)
        const userRec = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(res => res[0]);

        if (!userRec) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Update Profile based on type
        // Use validation:
        // If Org -> insert into organisations
        // If Individual -> check userType -> insert into musicianProfiles or professionalProfiles

        // Transaction to ensure atomicity
        await db.transaction(async (tx) => {
            const accType = userRec.accountType;
            const uType = userRec.userType;

            // Save raw response for audit/debugging
            await tx.insert(userOnboardingResponses).values({
                userId,
                questionKey: "profile_setup",
                response: profileData
            });

            if (accType === 'Individual') {
                if (uType === 'professional') {
                    // Create Professional Profile
                    await tx.insert(professionalProfiles).values({
                        userId,
                        role: "Other", // Default, user should refine this? or we map profileData.headline?
                        bio: profileData.bio || "",
                        location: profileData.location || "",
                        profileImageUrl: profileData.profileImageUrl,
                        // Update other fields as needed
                    });
                } else {
                    // Musician Profile (Default)
                    await tx.insert(musicianProfiles).values({
                        userId,
                        name: `${userRec.firstName} ${userRec.lastName}`,
                        bio: profileData.bio,
                        location: profileData.location,
                        profileImageUrl: profileData.profileImageUrl,
                        // Map headline -> experienceLevel? No.
                    });
                }
            } else {
                // Organization
                // Create Org
                const [org] = await tx.insert(organisations).values({
                    name: userRec.organisationName || "New Organization",
                    description: profileData.bio, // Mapping bio to description
                    location: profileData.location,
                    logoUrl: profileData.profileImageUrl,
                    type: accType || "Business",
                    // serviceArea mapping?
                }).returning();

                // Link User to Org
                await tx.insert(organisationMembers).values({
                    userId,
                    organisationId: org.id,
                    role: "admin"
                });
            }

            // 5. Update User Onboarding Step
            const targetStep = 2; // Move to Intent (Step 3? 0=Reg, 1=Profile, 2=Intent...)
            // If current is 0 (Reg done), set to 1 (Profile done)?
            // Plan: Step 0: Reg. Step 1: Profile. Step 2: Intent. Step 3: Apps. Step 4: Privacy.
            // If they just finished Profile, they are now at Step 2 (Intent).
            await tx.update(users).set({
                onboardingStep: 2,
                profileCompletionPercentage: 30
            }).where(eq(users.id, userId));
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Profile setup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
