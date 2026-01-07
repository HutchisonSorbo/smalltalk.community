import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { isAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Zod schema for creating a user with date validation
const createUserSchema = z.object({
    email: z.string().email("Valid email required"),
    firstName: z.string().min(1, "First name required").max(100),
    lastName: z.string().min(1, "Last name required").max(100),
    accountType: z.enum(["Individual", "Business", "Government Organisation", "Charity", "Other"]).default("Individual"),
    isAdmin: z.boolean().default(false),
    isMinor: z.boolean().default(false),
    onboardingCompleted: z.boolean().default(true),
    onboardingStep: z.number().min(0).max(10).default(0),
    dateOfBirth: z.string().optional().refine(
        (val) => !val || !isNaN(Date.parse(val)),
        { message: "Invalid date format" }
    ),
});

// Helper to verify admin access - uses isAdmin from lib/admin-auth.ts
async function verifyAdmin() {
    try {
        // Get the authenticated user first
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { authorized: false, adminId: null };
        }

        // Use centralized isAdmin check from admin-auth.ts
        const isAdminResult = await isAdmin();

        if (!isAdminResult) {
            return { authorized: false, adminId: null };
        }

        return { authorized: true, adminId: user.id };
    } catch (error) {
        console.error("[Admin API] Auth verification error:", error);
        return { authorized: false, adminId: null };
    }
}


// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = createUserSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const userData = parseResult.data;

        // Check if email already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, userData.email),
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            );
        }

        // Create the user
        const newUserId = uuidv4();
        const now = new Date();

        const [newUser] = await db.insert(users).values({
            id: newUserId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            accountType: userData.accountType,
            isAdmin: userData.isAdmin,
            isMinor: userData.isMinor,
            onboardingCompleted: userData.onboardingCompleted,
            onboardingStep: userData.onboardingStep,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
            createdAt: now,
            updatedAt: now,
        }).returning();

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_CREATE,
            targetType: TargetTypes.USER,
            targetId: newUserId,
            details: {
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`,
                accountType: userData.accountType,
                isAdmin: userData.isAdmin,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("[Admin API] Error creating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/users?id=xxx - Delete a single user
export async function DELETE(request: NextRequest) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === adminId) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Get user info before deletion for logging
        const userToDelete = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!userToDelete) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prevent deleting other admins (safety measure)
        if (userToDelete.isAdmin) {
            return NextResponse.json(
                { error: "Cannot delete admin users from this interface. Use the user profile page instead." },
                { status: 403 }
            );
        }

        // Delete user (cascades to related data due to FK constraints)
        await db.delete(users).where(eq(users.id, userId));

        // Log the action
        await logAdminAction({
            adminId,
            action: AdminActions.USER_DELETE,
            targetType: TargetTypes.USER,
            targetId: userId,
            details: {
                email: userToDelete.email,
                name: `${userToDelete.firstName || ""} ${userToDelete.lastName || ""}`.trim(),
            },
        });

        return NextResponse.json({
            success: true,
            deletedUser: {
                id: userToDelete.id,
                email: userToDelete.email,
            },
        });
    } catch (error) {
        console.error("[Admin API] Error deleting user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
