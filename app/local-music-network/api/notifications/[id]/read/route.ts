import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await storage.markNotificationAsRead(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
