import { db } from "../server/db";
import { users, apps, userRecommendedApps, userOnboardingResponses, type App } from "../shared/schema";
import { eq, inArray, and } from "drizzle-orm";

export async function generateRecommendations(userId: string) {
    // 1. Fetch User Data
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then((res: any) => res[0]);
    if (!user) return;

    // 2. Fetch Onboarding Responses (Profile & Intent)
    const responses = await db.select().from(userOnboardingResponses).where(eq(userOnboardingResponses.userId, userId));

    let primaryIntent = "";
    let specificGoals: string[] = [];
    let interests: string[] = [];

    for (const r of responses) {
        if (r.questionKey === 'intent') {
            const data = r.response as any;
            primaryIntent = data.primaryIntent;
            specificGoals = data.specificGoals || [];
        }
        if (r.questionKey === 'profile_setup') {
            const data = r.response as any;
            interests = data.interests || [];
        }
    }

    // 3. Fetch All Active Apps
    const allApps = await db.select().from(apps).where(eq(apps.isActive, true));

    // 4. Scoring Logic
    const recommendations: { appId: string, score: number }[] = [];

    for (const app of allApps) {
        let score = 0;
        let isEligible = true;

        // Account Type Check
        if (app.suitableForAccountTypes && app.suitableForAccountTypes.length > 0) {
            if (!app.suitableForAccountTypes.includes(user.accountType || "")) {
                isEligible = false; // Or strict penalty? Let's say ineligible if specifically restricted
                // Actually, suitableFor usually means "Good for", not "Only for".
                // But let's assume if the array exists, it acts as a filter or strong booster.
                // Let's treat it as a filter if AgeRestriction implies safety, but here it's business logic.
                // If suitableForAccountTypes is defined, and user type is NOT in it, skip.
                if (user.accountType) {
                    // If app lists types, and user type isn't there -> skip
                    continue;
                }
            } else {
                score += 50; // Match
            }
        } else {
            // Universal app
            score += 20;
        }

        // Age Restriction
        if (app.ageRestriction === 'adults_only' && user.isMinor) {
            continue;
        }
        if (app.ageRestriction === 'teens_and_up') {
            // Assuming strict child logic handled elsewhere, but if < 13 maybe hide?
            // user.isMinor is < 18.
            // We don't have isChild (<13) explicitly stored as bool, but dateOfBirth is in DB.
            // Let's assume for now isMinor means Check Age.
            if (user.isMinor) {
                // If very young, maybe skip?
                // For now, allow teens.
            }
        }

        // Intent Match
        if (app.relevantIntents && app.relevantIntents.length > 0) {
            if (app.relevantIntents.includes(primaryIntent)) {
                score += 40;
            }
            // Check specific goals
            for (const goal of specificGoals) {
                if (app.relevantIntents.includes(goal)) {
                    score += 10;
                }
            }
        }

        // Interest Match
        if (app.relevantInterests && app.relevantInterests.length > 0) {
            for (const interest of interests) {
                if (app.relevantInterests.includes(interest)) {
                    score += 15;
                }
            }
        }

        recommendations.push({ appId: app.id, score });
    }

    // 5. Store Recommendations
    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    // Clear old recommendations?
    await db.delete(userRecommendedApps).where(eq(userRecommendedApps.userId, userId));

    // Insert new
    // Limit to top 10?
    const topRecs = recommendations.slice(0, 10);

    if (topRecs.length > 0) {
        await db.insert(userRecommendedApps).values(
            topRecs.map((r: any) => ({
                userId,
                appId: r.appId,
                recommendationScore: r.score,
                shownAt: new Date(),
            }))
        );
    }
}
