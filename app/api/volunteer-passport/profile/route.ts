import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { volunteerProfiles, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
    headline: z.string().max(255).optional(),
    bio: z.string().optional(),
    locationSuburb: z.string().max(100).optional(),
    locationPostcode: z.string().max(20).optional(),
    privacySettings: z.object({
        profile_visibility: z.enum(["public", "verified_only", "private"]).optional(),
        show_email: z.boolean().optional(),
        show_phone: z.boolean().optional(),
    }).optional(),
});

// GET - Fetch current user's volunteer profile
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await db.query.volunteerProfiles.findFirst({
            where: eq(volunteerProfiles.userId, user.id),
        });

        if (!profile) {
            return NextResponse.json({ profile: null }, { status: 200 });
        }

        return NextResponse.json({ profile }, { status: 200 });
    } catch (error) {
        console.error("Error fetching volunteer profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// POST - Create volunteer profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if profile already exists
        const existing = await db.query.volunteerProfiles.findFirst({
            where: eq(volunteerProfiles.userId, user.id),
        });

        if (existing) {
            return NextResponse.json(
                { error: "Profile already exists. Use PATCH to update." },
                { status: 409 }
            );
        }

        const body = await request.json();
        const validated = profileSchema.parse(body);

        const [newProfile] = await db.insert(volunteerProfiles).values({
            userId: user.id,
            headline: validated.headline,
            bio: validated.bio,
            locationSuburb: validated.locationSuburb,
            locationPostcode: validated.locationPostcode,
            privacySettings: validated.privacySettings || { profile_visibility: "public", show_email: false, show_phone: false },
        }).returning();

        return NextResponse.json({ profile: newProfile }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error creating volunteer profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}

// PATCH - Update volunteer profile
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existing = await db.query.volunteerProfiles.findFirst({
            where: eq(volunteerProfiles.userId, user.id),
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Profile not found. Create one first." },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validated = profileSchema.parse(body);

        const [updated] = await db.update(volunteerProfiles)
            .set({
                ...validated,
                updatedAt: new Date(),
            })
            .where(eq(volunteerProfiles.userId, user.id))
            .returning();

        return NextResponse.json({ profile: updated }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error updating volunteer profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
