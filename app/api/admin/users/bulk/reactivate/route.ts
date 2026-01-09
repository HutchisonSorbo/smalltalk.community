import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkUserIdsSchema } from "@/lib/admin-utils";

// POST /api/admin/users/bulk/reactivate - Reactivate suspended users
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdminRequest();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = BulkUserIdsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { userIds } = validation.data;

        // Reactivate users by clearing the isSuspended flag
        await db
            .update(users)
            .set({
                isSuspended: false,
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
