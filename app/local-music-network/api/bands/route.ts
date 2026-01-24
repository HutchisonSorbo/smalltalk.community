import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { insertBandSchema } from "@shared/schema";

const bandFiltersSchema = z.object({
    location: z.string().optional(),
    genres: z.string().optional(),
    q: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        // Handle 'my' bands request
        if (query.my === 'true') {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            const bands = await storage.getBandsByUser(user.id);
            return NextResponse.json(bands);
        }

        const parsed = bandFiltersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid filter parameters", errors: parsed.error.issues },
                { status: 400 }
            );
        }

        const filters: any = {};
        const qData = parsed.data;

        if (qData.location) filters.location = qData.location;
        if (qData.q) filters.searchQuery = qData.q;

        // Pagination
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 12;
        filters.limit = limit;
        filters.offset = (page - 1) * limit;

        const bands = await storage.getBands(filters);
        return NextResponse.json(bands);
    } catch (error) {
        console.error("Error fetching bands:", error);
        return NextResponse.json({ message: "Failed to fetch bands" }, { status: 500 });
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

        const parsed = insertBandSchema.safeParse({ ...json, userId });

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.issues },
                { status: 400 }
            );
        }

        const band = await storage.createBand(parsed.data);
        return NextResponse.json(band, { status: 201 });
    } catch (error) {
        console.error("Error creating band:", error);
        return NextResponse.json({ message: "Failed to create band" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
