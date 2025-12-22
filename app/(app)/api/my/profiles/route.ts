import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const profiles = await storage.getMusicianProfilesByUser(user.id);
        return NextResponse.json(profiles);
    } catch (error) {
        console.error("Error fetching user profiles:", error);
        return NextResponse.json({ message: "Failed to fetch profiles" }, { status: 500 });
    }
}
