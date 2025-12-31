import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userRec = await db.select().from(users).where(eq(users.id, user.id)).limit(1).then(res => res[0]);

        if (!userRec) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            onboardingStep: userRec.onboardingStep,
            onboardingCompleted: userRec.onboardingCompleted,
            accountType: userRec.accountType,
            userType: userRec.userType
        });

    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
