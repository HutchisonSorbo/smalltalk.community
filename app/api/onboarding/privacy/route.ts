import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users, userPrivacySettings, userNotificationPreferences } from "@shared/schema";
import { eq } from "drizzle-orm";
import { privacyDetailsSchema } from "../../../../lib/onboarding-schemas";

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
        const result = privacyDetailsSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Validation failed" }, { status: 400 });
        }

        const { privacySettings, notificationPreferences } = result.data;
        const userId = user.id;

        await db.transaction(async (tx: any) => {
            // Upsert Privacy Settings
            // Check if exists
            const existingPrivacy = await tx.select().from(userPrivacySettings).where(eq(userPrivacySettings.userId, userId)).limit(1).then((res: any) => res[0]);

            if (existingPrivacy) {
                await tx.update(userPrivacySettings).set({ ...privacySettings, settingsUpdatedAt: new Date() }).where(eq(userPrivacySettings.userId, userId));
            } else {
                await tx.insert(userPrivacySettings).values({ ...privacySettings, userId });
            }

            // Upsert Notification Preferences
            const existingNotif = await tx.select().from(userNotificationPreferences).where(eq(userNotificationPreferences.userId, userId)).limit(1).then((res: any) => res[0]);

            if (existingNotif) {
                await tx.update(userNotificationPreferences).set({ ...notificationPreferences, preferencesUpdatedAt: new Date() }).where(eq(userNotificationPreferences.userId, userId));
            } else {
                await tx.insert(userNotificationPreferences).values({ ...notificationPreferences, userId });
            }

            // Update Step
            await tx.update(users).set({
                onboardingStep: 5,
                profileCompletionPercentage: 90
            }).where(eq(users.id, userId));
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Privacy settings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
