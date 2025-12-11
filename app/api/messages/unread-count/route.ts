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

        const count = await storage.getUnreadMessageCount(user.id);
        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return NextResponse.json({ message: "Failed to fetch unread count" }, { status: 500 });
    }
}
