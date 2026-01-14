import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { announcements, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { z } from "zod";

// Zod schema for announcement update
const updateAnnouncementSchema = z.object({
    title: z.string().max(200).optional().nullable(),
    message: z.string().min(1).max(2000).optional(),
    visibility: z.enum(["all", "public", "private"]).optional(),
    priority: z.number().int().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
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

// PATCH /api/admin/announcements/[id] - Update announcement
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = updateAnnouncementSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { title, message, visibility, priority, isActive } = parseResult.data;

        const updateValues: Record<string, unknown> = { updatedAt: new Date() };
        if (title !== undefined) updateValues.title = title;
        if (message !== undefined) updateValues.message = message;
        if (visibility !== undefined) updateValues.visibility = visibility;
        if (priority !== undefined) updateValues.priority = priority;
        if (isActive !== undefined) updateValues.isActive = isActive;

        const [updated] = await db
            .update(announcements)
            .set(updateValues)
            .where(eq(announcements.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }

        await logAdminAction({
            adminId,
            action: AdminActions.ANNOUNCEMENT_UPDATE,
            targetType: TargetTypes.ANNOUNCEMENT,
            targetId: id,
            details: { updatedFields: Object.keys(parseResult.data) },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Admin API] Error updating announcement:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/announcements/[id] - Delete announcement
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const [deleted] = await db
            .delete(announcements)
            .where(eq(announcements.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }

        await logAdminAction({
            adminId,
            action: AdminActions.ANNOUNCEMENT_DELETE,
            targetType: TargetTypes.ANNOUNCEMENT,
            targetId: id,
            details: { deletedTitle: deleted.title },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Admin API] Error deleting announcement:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
