import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertGigSchema } from "@shared/schema";
import { z } from "zod";

const gigFiltersSchema = z.object({
    location: z.string().optional(),
    date: z.string().optional(), // 'upcoming', 'past', 'today'
    genre: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const parsed = gigFiltersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid filter parameters", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const filters: any = parsed.data;

        // Pagination
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 12;
        filters.limit = limit;
        filters.offset = (page - 1) * limit;

        const gigs = await storage.getGigs(filters);
        return NextResponse.json(gigs);
    } catch (error) {
        console.error("Error fetching gigs:", error);
        return NextResponse.json({ message: "Failed to fetch gigs" }, { status: 500 });
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

        // Validation with Zod
        // Ensure creatorId is the current user and Date is properly formatted
        const payload = {
            ...json,
            creatorId: user.id,
            date: json.date ? new Date(json.date) : undefined
        };
        const parsed = insertGigSchema.safeParse(payload);

        if (!parsed.success) {
            console.log("Validation errors:", parsed.error.errors);
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const gigData = parsed.data;

        // Authorization Check
        // If posting for a band, must be admin/owner of that band
        if (gigData.bandId) {
            const isBandAdmin = await storage.isBandAdmin(gigData.bandId, user.id);
            if (!isBandAdmin) {
                return NextResponse.json({ message: "Not authorized to post gigs for this band" }, { status: 403 });
            }
        } else if (gigData.musicianId) {
            // If posting as a musician, must be owner of that profile
            const ps = await storage.getMusicianProfile(gigData.musicianId);
            if (!ps || ps.userId !== user.id) {
                return NextResponse.json({ message: "Not authorized to post gigs for this musician profile" }, { status: 403 });
            }
        } else {
            // Must have either bandId or musicianId (or maybe we allow generic user gigs? Schema allows nulls.. but business logic should restrict)
            return NextResponse.json({ message: "Gig must be associated with a Band or Musician Profile" }, { status: 400 });
        }

        const gig = await storage.createGig(gigData);
        return NextResponse.json(gig, { status: 201 });

    } catch (error) {
        console.error("Error creating gig:", error);
        return NextResponse.json({ message: "Failed to create gig" }, { status: 500 });
    }
}
