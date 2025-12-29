import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const bands = await storage.getBandsByUser(user.id);
        return NextResponse.json(bands);
    } catch (error) {
        console.error("Error fetching user bands:", error);
        return NextResponse.json({ message: "Failed to fetch your bands" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
