import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db
            .update(users)
            .set({
                onboardingCompleted: true,
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error completing onboarding:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
