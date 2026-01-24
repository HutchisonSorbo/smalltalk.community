import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray, eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { z } from "zod";

// Zod schema for bulk delete
const bulkDeleteSchema = z.object({
    userIds: z.array(z.string().min(1)).min(1, "At least one user ID required"),
});

// Helper to verify admin access
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

// DELETE /api/admin/users/bulk - Bulk delete users
export async function DELETE(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = bulkDeleteSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { userIds } = parseResult.data;

        // Prevent self-deletion
        if (userIds.includes(adminId)) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Get user info before deletion for logging
        const usersToDelete = await db
            .select({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName })
            .from(users)
            .where(inArray(users.id, userIds));

        if (usersToDelete.length === 0) {
            return NextResponse.json({ error: "No users found" }, { status: 404 });
        }

        // Delete users (cascades to related data due to FK constraints)
        await db.delete(users).where(inArray(users.id, userIds));

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_BULK_DELETE,
            targetType: TargetTypes.USER,
            targetId: "bulk",
            details: {
                deletedCount: usersToDelete.length,
                deletedUsers: usersToDelete.map((u: any) => ({
                    id: u.id,
                    email: u.email,
                    name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
                })),
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: usersToDelete.length,
        });
    } catch (error) {
        console.error("[Admin API] Error bulk deleting users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
