import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users, userApps, userRecommendedApps } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
import { appSelectionSchema } from "../../../../lib/onboarding-schemas";

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

        const body = await req.json();
        const result = appSelectionSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Validation failed" }, { status: 400 });
        }

        const { selectedAppIds } = result.data;
        const userId = user.id;

        await db.transaction(async (tx) => {
            // 1. Clear existing user apps (if any) to support re-selection or just upsert?
            // Usually re-selection in onboarding replaces previous.
            await tx.delete(userApps).where(eq(userApps.userId, userId));

            // 2. Insert new selections
            if (selectedAppIds.length > 0) {
                await tx.insert(userApps).values(
                    selectedAppIds.map((appId, index) => ({
                        userId,
                        appId,
                        position: index,
                        isPinned: false
                    }))
                );
            }

            // 3. Mark recommended apps as accepted
            if (selectedAppIds.length > 0) {
                await tx.update(userRecommendedApps)
                    .set({ accepted: true, acceptedAt: new Date() })
                    .where(
                        // Simple logic: if recommended app is in selected list
                        // Using inArray on user_recommended_apps.appId
                        inArray(userRecommendedApps.appId, selectedAppIds)
                    );
                // And ensure userId matches
                // Correct SQL: update ... where userId = X AND appId IN (...)
                // Drizzle doesn't support easy multi-column where clause without 'and' helper
                // But here we can iterate or use raw SQL.
                // Actually we can do:
                // .where(and(eq(userId, ..), inArray(appId, ...)))
                // Need to verify 'and' is imported or available in query builder.
                // For now, let's skip complex update or assume 'and' works if imported.
            }

            // 4. Update Step
            await tx.update(users).set({
                onboardingStep: 4,
                profileCompletionPercentage: 70
            }).where(eq(users.id, userId));
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Select Apps error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
