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
            return NextResponse.json({ message: "Invalid target type. Must be 'musician' or 'listing'" }, { status: 400 });
        }

        const reviews = await storage.getReviewsForTarget(targetType, targetId);
        const { average, count } = await storage.getAverageRating(targetType, targetId);

        return NextResponse.json({ reviews, average, count });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
