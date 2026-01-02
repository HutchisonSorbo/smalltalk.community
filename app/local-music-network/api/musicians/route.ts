import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { insertMusicianProfileSchema } from "@shared/schema";

export const dynamic = 'force-dynamic';

const musicianFiltersSchema = z.object({
    location: z.string().optional(),
    experienceLevel: z.string().optional(),
    availability: z.string().optional(),
    instruments: z.string().optional(),
    genres: z.string().optional(),
    q: z.string().optional(),
    hasLocation: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const parsed = musicianFiltersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid filter parameters", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const filters: any = {};
        const qData = parsed.data;

        if (qData.location) filters.location = qData.location;
        if (qData.q) filters.searchQuery = qData.q;
        if (qData.experienceLevel) filters.experienceLevel = qData.experienceLevel;
        if (qData.experienceLevel) filters.experienceLevel = qData.experienceLevel;
        if (qData.availability) filters.availability = qData.availability;
        if (qData.hasLocation === 'true') filters.hasLocation = true;

        if (qData.instruments) {
            const instruments = qData.instruments.split(',').filter(Boolean);
            if (instruments.length > 0) filters.instruments = instruments;
        }

        if (qData.genres) {
            const genres = qData.genres.split(',').filter(Boolean);
            if (genres.length > 0) filters.genres = genres;
        }

        // Pagination
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 12;
        filters.limit = limit;
        filters.offset = (page - 1) * limit;

        const profiles = await storage.getMusicianProfiles(Object.keys(filters).length > 0 ? filters : undefined);
        return NextResponse.json(profiles);
    } catch (error) {
        console.error("Error fetching musicians:", error);
        return NextResponse.json({
            message: "Failed to fetch musicians"
        }, { status: 500 });
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
        const parsed = insertMusicianProfileSchema.safeParse({ ...json, userId });

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const profile = await storage.createMusicianProfile(parsed.data);

        // Sync to users table for header display
        const nameParts = profile.name.split(' ');
        await storage.upsertUser({
            id: user.id,
            email: user.email!,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ') || '',
            profileImageUrl: profile.profileImageUrl,
            // Storage.upsertUser logic: inserts values, on conflict updates SET ...userData.
            // If I provide createdAt, it updates createdAt? Code: `updatedAt: new Date()`.
            // I should check storage.ts implementation again to be safe.
        });

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error("Error creating musician profile:", error);
        return NextResponse.json({ message: "Failed to create profile" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
