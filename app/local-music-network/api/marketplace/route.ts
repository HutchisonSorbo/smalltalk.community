import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { insertMarketplaceListingSchema } from "@shared/schema";

const marketplaceFiltersSchema = z.object({
    location: z.string().optional(),
    category: z.string().optional(),
    condition: z.string().optional(),
    minPrice: z.string().refine((val) => !val || !Number.isNaN(parseInt(val, 10)), {
        message: "minPrice must be a valid number",
    }).optional(),
    maxPrice: z.string().refine((val) => !val || !Number.isNaN(parseInt(val, 10)), {
        message: "maxPrice must be a valid number",
    }).optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const parsed = marketplaceFiltersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid filter parameters", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const filters: any = {};
        const q = parsed.data;

        if (q.location) filters.location = q.location;

        if (q.category) {
            const category = q.category.split(',').filter(Boolean);
            if (category.length > 0) filters.category = category;
        }

        if (q.condition) {
            const condition = q.condition.split(',').filter(Boolean);
            if (condition.length > 0) filters.condition = condition;
        }

        if (q.minPrice) {
            const minPrice = parseInt(q.minPrice, 10);
            if (!Number.isNaN(minPrice)) filters.minPrice = minPrice;
        }

        if (q.maxPrice) {
            const maxPrice = parseInt(q.maxPrice, 10);
            if (!Number.isNaN(maxPrice)) filters.maxPrice = maxPrice;
        }

        const listings = await storage.getMarketplaceListings(Object.keys(filters).length > 0 ? filters : undefined);
        return NextResponse.json(listings);
    } catch (error) {
        console.error("Error fetching marketplace listings:", error);
        return NextResponse.json({ message: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const userId = user.id;

        // Validate with Zod
        const parsed = insertMarketplaceListingSchema.safeParse({ ...json, userId });

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const listing = await storage.createMarketplaceListing(parsed.data);
        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        console.error("Error creating marketplace listing:", error);
        return NextResponse.json({ message: "Failed to create listing" }, { status: 500 });
    }
}
