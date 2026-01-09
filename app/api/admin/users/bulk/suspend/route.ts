import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkUserIdsSchema } from "@/lib/admin-utils";

// POST /api/admin/users/bulk/suspend - Suspend selected users
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

        // Filter out users who are admins - cannot suspend admins in bulk
        const usersToCheck = await db
            .select({ id: users.id, isAdmin: users.isAdmin })
            .from(users)
            .where(inArray(users.id, userIds));

        const eligibleUserIds = usersToCheck
            .filter(u => !u.isAdmin && u.id !== adminId)  // Cannot suspend admins or self
            .map(u => u.id);

        if (eligibleUserIds.length === 0) {
            return NextResponse.json({ error: "No eligible users to suspend (cannot suspend admin users)" }, { status: 400 });
        }

        // Suspend users by setting isSuspended flag and revoking admin status
        await db
            .update(users)
            .set({
                isSuspended: true,
                isAdmin: false,  // Revoke admin status if any
                updatedAt: new Date()
            })
            .where(inArray(users.id, eligibleUserIds));

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_SUSPEND,
            targetType: TargetTypes.USER,
            targetId: `bulk-suspend-${eligibleUserIds.length}`,
            details: { action: "suspend", userCount: eligibleUserIds.length, userIds: eligibleUserIds },
        });

        return NextResponse.json({
            success: true,
            suspendedCount: eligibleUserIds.length
        });
    } catch (error) {
        console.error("[Admin API] Bulk suspend error:", error);
        return NextResponse.json({ error: "Failed to suspend users" }, { status: 500 });
    }
}
