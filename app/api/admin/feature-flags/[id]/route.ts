import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { featureFlags, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";
import { z } from "zod";

// Zod schema for feature flag update
const updateFeatureFlagSchema = z.object({
    isEnabled: z.boolean(),
});

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

// PATCH /api/admin/feature-flags/[id] - Toggle feature flag
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
        const parseResult = updateFeatureFlagSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.errors[0]?.message || "isEnabled must be boolean" },
                { status: 400 }
            );
        }

        const { isEnabled } = parseResult.data;

        const [updated] = await db
            .update(featureFlags)
            .set({
                isEnabled,
                updatedAt: new Date(),
            })
            .where(eq(featureFlags.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
        }

        await logAdminAction({
            adminId,
            action: AdminActions.FEATURE_FLAG_UPDATE,
            targetType: TargetTypes.FEATURE_FLAG,
            targetId: id,
            details: { key: updated.key, isEnabled },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Admin API] Error updating feature flag:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
