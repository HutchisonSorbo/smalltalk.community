import { NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET(
    request: Request,
    props: { params: Promise<{ targetType: string; targetId: string }> }
) {
    const params = await props.params;
    try {
        const { targetType, targetId } = params;

        if (!["musician", "listing"].includes(targetType)) {
            return NextResponse.json({ message: "Invalid target type" }, { status: 400 });
        }

        const { average, count } = await storage.getAverageRating(targetType, targetId);
        return NextResponse.json({ average, count });
    } catch (error) {
        console.error("Error fetching rating:", error);
        return NextResponse.json({ message: "Failed to fetch rating" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
