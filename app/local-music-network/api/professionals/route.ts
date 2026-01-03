
import { storage } from "@/server/storage";
import { insertProfessionalProfileSchema } from "@shared/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const filtersSchema = z.object({
            location: z.string().optional(),
            role: z.string().optional(),
            query: z.string().optional(),
            limit: z.coerce.number().min(1).max(2000).default(12),
            offset: z.coerce.number().min(0).default(0),
            hasLocation: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
            userId: z.string().optional()
        });

        const parsed = filtersSchema.safeParse(query);

        if (!parsed.success) {
            return NextResponse.json({
                message: "Invalid filter parameters",
                errors: parsed.error.errors
            }, { status: 400 });
        }

        const qData = parsed.data;

        // If userId provided, return single profile for that user
        if (qData.userId) {
            const profile = await storage.getProfessionalProfileByUserId(qData.userId);
            if (!profile) return NextResponse.json({ message: "Not Found" }, { status: 404 });
            return NextResponse.json(profile);
        }

        const filters = {
            location: qData.location,
            role: qData.role,
            searchQuery: qData.query,
            limit: qData.limit,
            offset: qData.offset,
            hasLocation: qData.hasLocation,
        };

        if (filters.hasLocation) {
            const items = await storage.getProfessionalLocations(filters);
            return NextResponse.json(items);
        }

        const items = await storage.getProfessionalProfiles(filters);
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching professionals:", error);
        return NextResponse.json({
            message: "Failed to fetch professionals"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const existing = await storage.getProfessionalProfileByUserId(user.id);
        if (existing) {
            return new NextResponse("User already has a professional profile", { status: 409 });
        }

        const body = await request.json();
        const parseResult = insertProfessionalProfileSchema.safeParse({
            ...body,
            userId: user.id
        });

        if (!parseResult.success) {
            return NextResponse.json(parseResult.error, { status: 400 });
        }

        const item = await storage.createProfessionalProfile(parseResult.data);
        return NextResponse.json(item);
    } catch (error) {
        console.error("Failed to create professional profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
