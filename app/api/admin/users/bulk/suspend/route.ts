import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkUserIdsSchema } from "@/lib/admin-utils";

// CORS Headers
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS_HEADERS });
}

// POST /api/admin/users/bulk/suspend - Suspend selected users
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

        // Fetch users to check eligibility
        const usersToCheck = await db
            .select({ id: users.id, isAdmin: users.isAdmin })
            .from(users)
            .where(inArray(users.id, userIds));

        const foundUserIds = usersToCheck.map(u => u.id);
        const excludedNotFound = userIds.filter(id => !foundUserIds.includes(id)).length;
        const excludedByAdmin = usersToCheck.filter(u => u.isAdmin && u.id !== adminId).length;
        const excludedSelf = usersToCheck.filter(u => u.id === adminId).length;

        const eligibleUserIds = usersToCheck
            .filter(u => !u.isAdmin && u.id !== adminId)  // Cannot suspend admins or self
            .map(u => u.id);

        if (eligibleUserIds.length === 0) {
            return NextResponse.json({
                error: "No eligible users to suspend",
                details: {
                    totalChecked: userIds.length,
                    excludedByAdmin,
                    excludedSelf,
                    excludedNotFound
                }
            }, { status: 400, headers: CORS_HEADERS });
        }

        // Suspend users by setting isSuspended flag and revoking admin status
        const updatedUsers = await db
            .update(users)
            .set({
                isSuspended: true,
                isAdmin: false,  // Revoke admin status if any
                updatedAt: new Date()
            })
            .where(inArray(users.id, eligibleUserIds))
            .returning({ id: users.id });

        const suspendedCount = updatedUsers.length;

        // Log the action with accurate count
        await logAdminAction({
            adminId,
            action: AdminActions.USER_SUSPEND,
            targetType: TargetTypes.USER,
            targetId: `bulk-suspend-${suspendedCount}`,
            details: {
                action: "suspend",
                userCount: suspendedCount,
                userIds: updatedUsers.map(u => u.id),
                excluded: {
                    admin: excludedByAdmin,
                    self: excludedSelf,
                    notFound: excludedNotFound
                }
            },
        });

        return NextResponse.json({
            success: true,
            suspendedCount,
            excluded: {
                admin: excludedByAdmin,
                self: excludedSelf,
                notFound: excludedNotFound
            }
        }, { headers: CORS_HEADERS });
    } catch (error) {
        console.error("[Admin API] Bulk suspend error:", error);
        return NextResponse.json({ error: "Failed to suspend users" }, { status: 500, headers: CORS_HEADERS });
    }
}
