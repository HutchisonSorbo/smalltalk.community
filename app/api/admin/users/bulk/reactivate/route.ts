import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkUserIdsSchema } from "@/lib/admin-utils";

// CORS Headers
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS_HEADERS });
}

// POST /api/admin/users/bulk/reactivate - Reactivate suspended users
export async function POST(request: NextRequest) {
    // CSRF Protection: Validate Origin/Referer
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (appUrl && origin && !origin.startsWith(appUrl)) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: CORS_HEADERS });
    }

    const { authorized, adminId } = await verifyAdminRequest();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = BulkUserIdsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0]?.message || "Invalid input" },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const { userIds } = validation.data;

        // Reactivate users by clearing the isSuspended flag
        const updatedUsers = await db
            .update(users)
            .set({
                isSuspended: false,
                updatedAt: new Date()
            })
            .where(inArray(users.id, userIds))
            .returning({ id: users.id });

        const reactivatedCount = updatedUsers.length;

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_UNSUSPEND,
            targetType: TargetTypes.USER,
            targetId: `bulk-reactivate-${reactivatedCount}`,
            details: { action: "reactivate", userCount: reactivatedCount, userIds: updatedUsers.map(u => u.id) },
        });

        return NextResponse.json({
            success: true,
            reactivatedCount
        }, { headers: CORS_HEADERS });
    } catch (error) {
        console.error("[Admin API] Bulk reactivate error:", error);
        return NextResponse.json({ error: "Failed to reactivate users" }, { status: 500, headers: CORS_HEADERS });
    }
}
