import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ count: 0 });
        }

        // For now, return 0 as notifications feature is not yet implemented at platform level
        // This prevents 404 errors in PlatformHeader
        return NextResponse.json({ count: 0 });
    } catch (error) {
        console.error("Error fetching unread notification count:", error);
        return NextResponse.json({ count: 0 });
    }
}
