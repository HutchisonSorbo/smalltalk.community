import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkUserIdsSchema } from "@/lib/admin-utils";
import { checkRateLimit } from "@/lib/rate-limiter";

// Fail-fast: Validate NEXT_PUBLIC_APP_URL at module load
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) {
    throw new Error("CRITICAL: NEXT_PUBLIC_APP_URL is not configured for bulk API routes");
}

// CORS Headers
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": APP_URL,
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
    // CSRF Protection: Strict Origin Match
    const origin = request.headers.get("origin");
    if (!origin || origin !== APP_URL) {
        console.warn(`[Admin API] CSRF Block: Origin mismatch. Received: ${origin}, Expected: ${APP_URL}`);
        return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: CORS_HEADERS });
    }

    const { authorized, adminId } = await verifyAdminRequest();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    // Rate Limiting: 10 requests per minute for bulk actions
    const isAllowed = await checkRateLimit(adminId, "bulk-reactivate", 10, 60);
    if (!isAllowed) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: CORS_HEADERS });
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

        // Fetch users to check eligibility (only suspended non-admins)
        const usersToCheck = await db
            .select({ id: users.id, isAdmin: users.isAdmin, isSuspended: users.isSuspended })
            .from(users)
            .where(inArray(users.id, userIds));

        const eligibleUserIds = usersToCheck
            .filter(u => u.isSuspended && !u.isAdmin)
            .map(u => u.id);

        const excludedByAdmin = usersToCheck.filter(u => u.isAdmin).length;
        const excludedNotSuspended = usersToCheck.filter(u => !u.isSuspended).length;
        const excludedNotFound = userIds.filter(id => !usersToCheck.some(u => u.id === id)).length;

        if (eligibleUserIds.length === 0) {
            return NextResponse.json({
                error: "No eligible users to reactivate",
                details: {
                    totalChecked: userIds.length,
                    excludedByAdmin,
                    excludedNotSuspended,
                    excludedNotFound
                }
            }, { status: 400, headers: CORS_HEADERS });
        }

        // Reactivate users by clearing the isSuspended flag
        const updatedUsers = await db
            .update(users)
            .set({
                isSuspended: false,
                updatedAt: new Date()
            })
            .where(inArray(users.id, eligibleUserIds))
            .returning({ id: users.id });

        const reactivatedCount = updatedUsers.length;

        // Log the action with accurate count and details
        await logAdminAction({
            adminId,
            action: AdminActions.USER_BULK_UNSUSPEND,
            targetType: TargetTypes.USER,
            targetId: `bulk-reactivate-${reactivatedCount}`,
            details: {
                action: "reactivate",
                userCount: reactivatedCount,
                userIds: updatedUsers.map(u => u.id),
                ignoredIds: userIds.filter(id => !eligibleUserIds.includes(id)),
                exclusions: {
                    admin: excludedByAdmin,
                    notSuspended: excludedNotSuspended,
                    notFound: excludedNotFound
                }
            },
        });

        return NextResponse.json({
            success: true,
            reactivatedCount,
            excluded: {
                admin: excludedByAdmin,
                notSuspended: excludedNotSuspended,
                notFound: excludedNotFound
            }
        }, { headers: CORS_HEADERS });
    } catch (error) {
        console.error("[Admin API] Bulk reactivate error:", error);
        return NextResponse.json({ error: "Failed to reactivate users" }, { status: 500, headers: CORS_HEADERS });
    }
}
