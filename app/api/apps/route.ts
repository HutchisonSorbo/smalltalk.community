import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps } from "@shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allApps = await db
            .select({
                id: apps.id,
                name: apps.name,
                description: apps.description,
                iconUrl: apps.iconUrl,
                route: apps.route,
                category: apps.category,
                isBeta: apps.isBeta,
                isActive: apps.isActive,
            })
            .from(apps)
            .where(eq(apps.isActive, true));
        return NextResponse.json(allApps);
    } catch (error) {
        console.error("Error fetching apps:", error);
        return NextResponse.json({ message: "Failed to fetch apps" }, { status: 500 });
    }
}
