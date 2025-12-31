import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { apps, userRecommendedApps } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch User Recommendations joined with Apps
        const recs = await db.select({
            score: userRecommendedApps.recommendationScore,
            app: apps // Select full app object
        })
            .from(userRecommendedApps)
            .innerJoin(apps, eq(userRecommendedApps.appId, apps.id))
            .where(eq(userRecommendedApps.userId, user.id))
            .orderBy(desc(userRecommendedApps.recommendationScore));

        return NextResponse.json({ recommendations: recs });

    } catch (error) {
        console.error("Recommendations error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
