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
        const { title, message, visibility, priority, isActive } = body;

        const [updated] = await db
            .update(announcements)
            .set({
                title: title !== undefined ? title : undefined,
                message: message !== undefined ? message : undefined,
                visibility: visibility !== undefined ? visibility : undefined,
                priority: priority !== undefined ? priority : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                updatedAt: new Date(),
            })
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
            details: { updatedFields: Object.keys(body) },
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
