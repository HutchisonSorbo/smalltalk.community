import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { announcements, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { z } from "zod";

// Zod schema for announcement creation
const createAnnouncementSchema = z.object({
    title: z.string().max(200).optional().nullable(),
    message: z.string().min(1, "Message is required").max(2000),
    visibility: z.enum(["all", "public", "private"]).default("all"),
    priority: z.number().int().min(0).max(100).default(0),
    isActive: z.boolean().default(true),
});

async function verifyAdmin() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { authorized: false, adminId: null };
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser || !dbUser.isAdmin) {
            return { authorized: false, adminId: null };
        }

        return { authorized: true, adminId: user.id };
    } catch (error) {
        console.error("[Admin API] Auth verification error:", error);
        return { authorized: false, adminId: null };
    }
}

// POST /api/admin/announcements - Create announcement
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = createAnnouncementSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { title, message, visibility, priority, isActive } = parseResult.data;

        const [newAnnouncement] = await db
            .insert(announcements)
            .values({
                title: title || null,
                message,
                visibility,
                priority,
                isActive,
            })
            .returning();

        await logAdminAction({
            adminId,
            action: AdminActions.ANNOUNCEMENT_CREATE,
            targetType: TargetTypes.ANNOUNCEMENT,
            targetId: newAnnouncement.id,
            details: { title, visibility },
        });

        return NextResponse.json(newAnnouncement, { status: 201 });
    } catch (error) {
        console.error("[Admin API] Error creating announcement:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
