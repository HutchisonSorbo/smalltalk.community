import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertReviewSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const reviewerId = user.id;
        const json = await request.json();
        const { targetType, targetId, rating, comment } = json;

        if (!["musician", "listing"].includes(targetType)) {
            return NextResponse.json({ message: "Invalid target type. Must be 'musician' or 'listing'" }, { status: 400 });
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 });
        }

        // Check if target exists
        if (targetType === "musician") {
            const profile = await storage.getMusicianProfile(targetId);
            if (!profile) {
                return NextResponse.json({ message: "Musician profile not found" }, { status: 404 });
            }
            // Can't review your own profile
            if (profile.userId === reviewerId) {
                return NextResponse.json({ message: "Cannot review your own profile" }, { status: 400 });
            }
        } else {
            const listing = await storage.getMarketplaceListing(targetId);
            if (!listing) {
                return NextResponse.json({ message: "Marketplace listing not found" }, { status: 404 });
            }
            // Can't review your own listing
            if (listing.userId === reviewerId) {
                return NextResponse.json({ message: "Cannot review your own listing" }, { status: 400 });
            }
        }

        // Check if user already reviewed this target
        const hasReviewed = await storage.hasUserReviewed(reviewerId, targetType, targetId);
        if (hasReviewed) {
            return NextResponse.json({ message: "You have already reviewed this" }, { status: 400 });
        }

        const validatedData = insertReviewSchema.parse({
            reviewerId,
            targetType,
            targetId,
            rating: parseInt(rating, 10),
            comment: comment || null,
        });

        const review = await storage.createReview(validatedData);
        return NextResponse.json(review, { status: 201 });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
            const zodError = error as { errors?: Array<{ message?: string }> };
            const firstError = zodError.errors?.[0]?.message || "Invalid review data";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }
        console.error("Error creating review:", error);
        return NextResponse.json({ message: "Failed to create review" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
