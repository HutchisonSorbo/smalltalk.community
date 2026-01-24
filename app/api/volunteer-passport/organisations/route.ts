import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { organisations } from "@shared/schema";
import { eq, desc, like } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List organisations (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const verified = searchParams.get("verified");

        let query = db.select().from(organisations);

        const allOrgs = await query.orderBy(desc(organisations.createdAt));

        // Filter in memory for now (can optimize with Drizzle conditions)
        let filtered = allOrgs;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((org: any) =>
                org.name.toLowerCase().includes(searchLower) ||
                org.description?.toLowerCase().includes(searchLower)
            );
        }

        if (verified === "true") {
            filtered = filtered.filter((org: any) => org.isVerified);
        }

        return NextResponse.json({ organisations: filtered }, { status: 200 });
    } catch (error) {
        console.error("Error fetching organisations:", error);
        return NextResponse.json(
            { error: "Failed to fetch organisations" },
            { status: 500 }
        );
    }
}
