"use server";

import { db } from "@/server/db";
import { volunteerProfiles, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function getVolunteerProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await db.query.volunteerProfiles.findFirst({
        where: eq(volunteerProfiles.userId, user.id),
        with: {
            user: true
        }
    });

    if (!profile) {
        // Optionally create one if it doesn't exist?
        // For now return null, form handles creation
        return null;
    }

    return profile;
}

export async function upsertVolunteerProfile(data: {
    headline: string;
    bio: string;
    locationSuburb: string;
    locationPostcode: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const existing = await db.query.volunteerProfiles.findFirst({
        where: eq(volunteerProfiles.userId, user.id)
    });

    if (existing) {
        await db.update(volunteerProfiles)
            .set({
                headline: data.headline,
                bio: data.bio,
                locationSuburb: data.locationSuburb,
                locationPostcode: data.locationPostcode,
                updatedAt: new Date()
            })
            .where(eq(volunteerProfiles.id, existing.id));
    } else {
        await db.insert(volunteerProfiles).values({
            userId: user.id,
            headline: data.headline,
            bio: data.bio,
            locationSuburb: data.locationSuburb,
            locationPostcode: data.locationPostcode,
        });
    }

    revalidatePath("/volunteer-passport/profile");
    return { success: true };
}

// CodeRabbit Audit Trigger
