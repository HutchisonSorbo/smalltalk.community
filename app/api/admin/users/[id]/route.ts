import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { z } from "zod";

// Zod schema for user update
const updateUserSchema = z.object({
    isAdmin: z.boolean().optional(),
    isMinor: z.boolean().optional(),
    messagePrivacy: z.enum(["anyone", "connections", "none"]).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
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

// GET /api/admin/users/[id] - Get user details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[Admin API] Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/admin/users/[id] - Update user
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
        const parseResult = updateUserSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const updateData = parseResult.data;

        // Perform update
        const [updatedUser] = await db
            .update(users)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Log the action
        let action: string = AdminActions.USER_UPDATE;
        if ("isAdmin" in updateData) {
            action = updateData.isAdmin ? AdminActions.USER_MAKE_ADMIN : AdminActions.USER_REMOVE_ADMIN;
        }

        await logAdminAction({
            adminId,
            action,
            targetType: TargetTypes.USER,
            targetId: id,
            details: { updatedFields: Object.keys(updateData), newValues: updateData },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[Admin API] Error updating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === adminId) {
        return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    try {
        // Get user info before deletion for logging
        const userToDelete = await db.query.users.findFirst({
            where: eq(users.id, id),
        });

        if (!userToDelete) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete user (cascades to related data due to FK constraints)
        await db.delete(users).where(eq(users.id, id));

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_DELETE,
            targetType: TargetTypes.USER,
            targetId: id,
            details: {
                deletedEmail: userToDelete.email,
                deletedName: `${userToDelete.firstName} ${userToDelete.lastName}`.trim(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Admin API] Error deleting user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
