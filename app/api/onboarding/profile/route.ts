import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import {
    users,
    musicianProfiles,
    professionalProfiles,
    organisations,
    organisationMembers,
    userOnboardingResponses,
    userPrivacySettings
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { profileSetupSchema } from "../../../../lib/onboarding-schemas";

// Use service role for database updates that might require admin privilegies or bypassing RLS if needed (though we use Drizzle so we bypass RLS mostly unless using Postgres directly via Supabase client)
// We use Drizzle for DB, so we don't need Supabase Sudo client strictly, but we need to verify the user from the Request headers/Supabase token.
// Actually, in App Router, we should use createServerClient from @supabase/ssr usually.
// But we are sticking to simple verification for now or assuming middleware passed user.
// Let's use the Authorization header to verify the user using basic supabase client.

export const dynamic = 'force-dynamic'; // Ensure not cached

function generateSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const suffix = crypto.randomUUID().substring(0, 8);
    return `${base}-${suffix}`;
}

const ONBOARDING_STEPS = {
    REGISTRATION: 0,
    PROFILE_SETUP: 1,
    INTENT: 2,
    APPS: 3,
    PRIVACY: 4,
};

const PROFILE_COMPLETION_STAGES = {
    ACCOUNT_CREATED: 10,
    PROFILE_SETUP_DONE: 30,
};

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
        const userRec = await db.select().from(users).where(eq(users.id, userId)).limit(1).then((res: any) => res[0]);

        if (!userRec) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3.1 Handle Date of Birth / Age Verification for OAuth users
        let userUpdates: any = {};

        // Critical: Ensure Date of Birth is provided if not already on record (e.g. OAuth users)
        if (!userRec.dateOfBirth && !profileData.dateOfBirth) {
            return NextResponse.json({
                error: "Date of birth is required for account setup"
            }, { status: 400 });
        }

        if (profileData.dateOfBirth) {
            const dob = new Date(profileData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            if (age < 13) {
                return NextResponse.json({
                    error: "You must be at least 13 years old to use this platform."
                }, { status: 400 });
            }

            userUpdates.dateOfBirth = dob;
            const isMinor = age < 18;
            userUpdates.isMinor = isMinor;

            // Enforce privacy for minors
            if (isMinor) {
                userUpdates.messagePrivacy = 'verified_only';
            }
        }

        // 4. Update Profile based on type
        // Use validation:
        // If Org -> insert into organisations
        // If Individual -> check userType -> insert into musicianProfiles or professionalProfiles

        // Transaction to ensure atomicity
        await db.transaction(async (tx: any) => {
            const accType = userRec.accountType;
            const uType = userRec.userType;

            // Save raw response for audit/debugging
            await tx.insert(userOnboardingResponses).values({
                userId,
                questionKey: "profile_setup",
                response: profileData
            });

            // Enforce strict privacy defaults for minors
            if (userUpdates.isMinor) {
                await tx.insert(userPrivacySettings).values({
                    userId,
                    profileVisibility: 'private',
                    showRealName: false,
                    showLocation: false,
                    showAge: false,
                    allowEmailLookup: false,
                    defaultPostVisibility: 'community'
                }).onConflictDoUpdate({
                    target: userPrivacySettings.userId,
                    set: {
                        profileVisibility: 'private',
                        showRealName: false,
                        showLocation: false,
                        showAge: false,
                        allowEmailLookup: false
                    }
                });
            }

            if (accType === 'Individual') {
                if (uType === 'professional') {
                    // Create Professional Profile
                    await tx.insert(professionalProfiles).values({
                        userId,
                        role: (profileData.headline?.trim().substring(0, 50)) || "Professional",
                        bio: profileData.bio || "",
                        location: profileData.location || "",
                        profileImageUrl: profileData.profileImageUrl,
                        // Update other fields as needed
                    });
                } else {
                    // Musician Profile (Default)
                    await tx.insert(musicianProfiles).values({
                        userId,
                        name: [userRec.firstName, userRec.lastName].filter(Boolean).join(" ").trim() || "Unnamed Musician",
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
                    slug: generateSlug(userRec.organisationName || "New Organization"),
                    description: profileData.bio, // Mapping bio to description
                    logoUrl: profileData.profileImageUrl,
                    // location and type are not in organisations schema
                }).returning();

                // Link User to Org
                await tx.insert(organisationMembers).values({
                    userId,
                    organisationId: org.id,
                    role: "admin"
                });
            }

            // 5. Update User Onboarding Step
            // If they just finished Profile, they are now at Step 2 (Intent).
            await tx.update(users).set({
                ...userUpdates,
                onboardingStep: ONBOARDING_STEPS.INTENT,
                profileCompletionPercentage: PROFILE_COMPLETION_STAGES.PROFILE_SETUP_DONE
            }).where(eq(users.id, userId));
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Profile setup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
