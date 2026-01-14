import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertMarketplaceListingSchema } from "@shared/schema";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const listing = await storage.getMarketplaceListing(params.id);
        if (!listing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        // Get seller info
        const seller = await storage.getUser(listing.userId);
        return NextResponse.json({ ...listing, seller });
    } catch (error) {
        console.error("Error fetching marketplace listing:", error);
        return NextResponse.json({ message: "Failed to fetch listing" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existing = await storage.getMarketplaceListing(params.id);

        if (!existing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const json = await request.json();
        const parsed = insertMarketplaceListingSchema.partial().safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.issues },
                { status: 400 }
            );
        }

        // Strip userId and id to prevent ownership reassignment
        const { userId: _, id: __, ...safeData } = parsed.data as any;
        const updated = await storage.updateMarketplaceListing(params.id, safeData);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating marketplace listing:", error);
        return NextResponse.json({ message: "Failed to update listing" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existing = await storage.getMarketplaceListing(params.id);

        if (!existing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        await storage.deleteMarketplaceListing(params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting marketplace listing:", error);
        return NextResponse.json({ message: "Failed to delete listing" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
