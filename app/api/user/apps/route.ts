import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { userApps, apps } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const toggleAppSchema = z.object({
    appId: z.string(),
});

// GET: Get user's selected apps
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Join user_apps with apps to get details
        const userAppsList = await db
            .select({
                id: apps.id,
                name: apps.name,
                description: apps.description,
                iconUrl: apps.iconUrl,
                route: apps.route,
                category: apps.category,
                isBeta: apps.isBeta,
                isPinned: userApps.isPinned,
            })
            .from(userApps)
            .innerJoin(apps, eq(userApps.appId, apps.id))
            .where(eq(userApps.userId, user.id));

        return NextResponse.json(userAppsList);
    } catch (error) {
        console.error("Error fetching user apps:", error);
        return NextResponse.json({
            message: "Internal server error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = toggleAppSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { appId } = parsed.data;

        // Verify app exists and is active
        const appExists = await db
            .select({ id: apps.id })
            .from(apps)
            .where(and(eq(apps.id, appId), eq(apps.isActive, true)))
            .limit(1);

        if (appExists.length === 0) {
            return NextResponse.json({ error: "App not found or inactive" }, { status: 404 });
        }

        // Check if already added
        const existing = await db
            .select()
            .from(userApps)
            .where(and(eq(userApps.userId, user.id), eq(userApps.appId, appId)))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ message: "App already added" }, { status: 200 });
        }

        await db.insert(userApps).values({
            userId: user.id,
            appId: appId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error adding app:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove an app
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const parsed = toggleAppSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        await db.delete(userApps).where(
            and(
                eq(userApps.userId, user.id),
                eq(userApps.appId, parsed.data.appId)
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing app:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
