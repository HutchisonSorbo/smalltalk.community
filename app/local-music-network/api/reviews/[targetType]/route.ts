import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(
    request: Request,
    props: { params: Promise<{ targetType: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const reviewId = params.targetType;
        const existingReview = await storage.getReview(reviewId);

        if (!existingReview) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }

        if (existingReview.reviewerId !== user.id) {
            return NextResponse.json({ message: "You don't have permission to edit this review" }, { status: 403 });
        }

        const json = await request.json();
        const { rating, comment } = json;

        if (rating && (rating < 1 || rating > 5)) {
            return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 });
        }

        const updatedReview = await storage.updateReview(reviewId, {
            rating: rating ? parseInt(rating, 10) : undefined,
            comment: comment !== undefined ? comment : undefined,
        });

        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ message: "Failed to update review" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ targetType: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const reviewId = params.targetType;
        const existingReview = await storage.getReview(reviewId);

        if (!existingReview) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }

        if (existingReview.reviewerId !== user.id) {
            return NextResponse.json({ message: "You don't have permission to delete this review" }, { status: 403 });
        }

        await storage.deleteReview(reviewId);
        return NextResponse.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json({ message: "Failed to delete review" }, { status: 500 });
    }
}
