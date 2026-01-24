import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { apps, users, userOnboardingResponses } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = 'force-dynamic';

// Interest to app mapping for scoring
const INTEREST_APP_MAP: Record<string, { appRoute: string; score: number }[]> = {
    // Music interests -> Local Music Network
    "music_playing": [{ appRoute: "/local-music-network", score: 25 }],
    "music_bands": [{ appRoute: "/local-music-network", score: 30 }],
    "music_events": [{ appRoute: "/local-music-network", score: 20 }],
    "music_recording": [{ appRoute: "/local-music-network", score: 20 }],
    "music_gear": [{ appRoute: "/local-music-network", score: 25 }],

    // Employment interests -> Apprenticeship Hub
    "employment_apprenticeships": [{ appRoute: "/apprenticeship-hub", score: 35 }],
    "employment_traineeships": [{ appRoute: "/apprenticeship-hub", score: 35 }],
    "employment_jobs": [{ appRoute: "/apprenticeship-hub", score: 25 }],
    "employment_career_advice": [{ appRoute: "/apprenticeship-hub", score: 20 }],
    "employment_tafe": [{ appRoute: "/apprenticeship-hub", score: 30 }],

    // Wellbeing interests -> Youth Service Navigator, Peer Support Finder
    "wellbeing_mental_health": [
        { appRoute: "/youth-service-navigator", score: 35 },
        { appRoute: "/peer-support-finder", score: 25 }
    ],
    "wellbeing_peer_support": [
        { appRoute: "/peer-support-finder", score: 35 },
        { appRoute: "/youth-service-navigator", score: 20 }
    ],
    "wellbeing_counselling": [
        { appRoute: "/youth-service-navigator", score: 30 }
    ],
    "wellbeing_crisis": [
        { appRoute: "/youth-service-navigator", score: 25 }
    ],
    "wellbeing_general": [
        { appRoute: "/youth-service-navigator", score: 20 },
        { appRoute: "/peer-support-finder", score: 20 }
    ],

    // Community interests -> Volunteer Passport
    "community_volunteering": [{ appRoute: "/volunteer-passport", score: 35 }],
    "community_events": [{ appRoute: "/volunteer-passport", score: 20 }],
    "community_networking": [{ appRoute: "/volunteer-passport", score: 15 }],
    "community_clubs": [{ appRoute: "/volunteer-passport", score: 20 }],
    "community_mentoring": [{ appRoute: "/volunteer-passport", score: 25 }],
};

// Situation to app mapping
const SITUATION_APP_MAP: Record<string, { appRoute: string; score: number }[]> = {
    "student_school": [
        { appRoute: "/youth-service-navigator", score: 15 },
        { appRoute: "/apprenticeship-hub", score: 10 }
    ],
    "student_tertiary": [
        { appRoute: "/peer-support-finder", score: 10 },
        { appRoute: "/apprenticeship-hub", score: 15 }
    ],
    "looking_for_work": [
        { appRoute: "/apprenticeship-hub", score: 25 }
    ],
    "taking_a_break": [
        { appRoute: "/youth-service-navigator", score: 15 },
        { appRoute: "/peer-support-finder", score: 15 },
        { appRoute: "/volunteer-passport", score: 20 }
    ],
};

export async function GET(req: Request) {
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

        // Fetch all active apps
        const allApps = await db
            .select()
            .from(apps)
            .where(eq(apps.isActive, true));

        // Fetch user's interests
        const interestsResponse = await db
            .select()
            .from(userOnboardingResponses)
            .where(
                and(
                    eq(userOnboardingResponses.userId, user.id),
                    eq(userOnboardingResponses.questionKey, "interests")
                )
            );

        const userInterests: string[] = Array.isArray(interestsResponse[0]?.response)
            ? interestsResponse[0].response as string[]
            : [];

        // Fetch user's situation
        const situationResponse = await db
            .select()
            .from(userOnboardingResponses)
            .where(
                and(
                    eq(userOnboardingResponses.userId, user.id),
                    eq(userOnboardingResponses.questionKey, "current_situation")
                )
            );

        const situationData = situationResponse[0]?.response as { situation?: string } | null;
        const userSituation = situationData?.situation || "";

        // Calculate scores for each app
        const appScores: Record<string, number> = {};

        // Initialize with base scores
        allApps.forEach((app: any) => {
            if (app.route) {
                appScores[app.route] = 10; // Base score
            }
        });

        // Add interest-based scores
        userInterests.forEach((interest: any) => {
            const mappings = INTEREST_APP_MAP[interest] || [];
            mappings.forEach(({ appRoute, score }: any) => {
                if (appScores[appRoute] !== undefined) {
                    appScores[appRoute] += score;
                }
            });
        });

        // Add situation-based scores
        if (userSituation && SITUATION_APP_MAP[userSituation]) {
            SITUATION_APP_MAP[userSituation].forEach(({ appRoute, score }: any) => {
                if (appScores[appRoute] !== undefined) {
                    appScores[appRoute] += score;
                }
            });
        }

        // Build recommendations list with reasons
        const recommendations = allApps
            .filter((app: any) => app.route)
            .map((app: any) => ({
                app: {
                    id: app.id,
                    name: app.name,
                    description: app.description,
                    iconUrl: app.iconUrl,
                    category: app.category,
                    isBeta: app.isBeta,
                    route: app.route,
                },
                score: appScores[app.route!] || 10,
            }))
            .sort((a: any, b: any) => b.score - a.score);

        return NextResponse.json({ recommendations });

    } catch (error) {
        console.error("Recommendations error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
