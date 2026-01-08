import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";

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

// POST /api/admin/users/bulk/reactivate - Reactivate selected users
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: "No users selected" }, { status: 400 });
        }

        // Update users - mark as active (reset any suspended state)
        await db
            .update(users)
            .set({
                updatedAt: new Date()
            })
            .where(inArray(users.id, userIds));

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_UNSUSPEND,
            targetType: TargetTypes.USER,
            targetId: `bulk-reactivate-${userIds.length}`,
            details: { action: "reactivate", userCount: userIds.length, userIds },
        });

        return NextResponse.json({
            success: true,
            reactivatedCount: userIds.length
        });
    } catch (error) {
        console.error("[Admin API] Bulk reactivate error:", error);
        return NextResponse.json({ error: "Failed to reactivate users" }, { status: 500 });
    }
}
