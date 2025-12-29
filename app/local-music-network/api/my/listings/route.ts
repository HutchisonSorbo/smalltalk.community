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

        const listings = await storage.getMarketplaceListingsByUser(user.id);
        return NextResponse.json(listings);
    } catch (error) {
        console.error("Error fetching user listings:", error);
        return NextResponse.json({ message: "Failed to fetch listings" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
