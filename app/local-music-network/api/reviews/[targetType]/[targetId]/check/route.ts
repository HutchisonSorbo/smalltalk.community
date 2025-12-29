import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(
    request: Request,
    props: { params: Promise<{ targetType: string; targetId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { targetType, targetId } = params;

        if (!["musician", "listing"].includes(targetType)) {
            return NextResponse.json({ message: "Invalid target type" }, { status: 400 });
        }

        const hasReviewed = await storage.hasUserReviewed(user.id, targetType, targetId);
        return NextResponse.json({ hasReviewed });
    } catch (error) {
        console.error("Error checking review:", error);
        return NextResponse.json({ message: "Failed to check review status" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
