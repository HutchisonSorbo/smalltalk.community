import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { announcements, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";

async function verifyAdmin() {
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
}

// POST /api/admin/announcements - Create announcement
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, message, visibility, priority, isActive } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const [newAnnouncement] = await db
            .insert(announcements)
            .values({
                title: title || null,
                message,
                visibility: visibility || "all",
                priority: priority ?? 0,
                isActive: isActive ?? true,
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
