
import { storage } from "@/server/storage";
import { insertProfessionalProfileSchema } from "@shared/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId provided, return single profile for that user (check logic)
    if (userId) {
        const profile = await storage.getProfessionalProfileByUserId(userId);
        if (!profile) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(profile);
    }

    const filters = {
        location: searchParams.get('location') || undefined,
        role: searchParams.get('role') || undefined,
        searchQuery: searchParams.get('query') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        hasLocation: searchParams.get('hasLocation') === 'true',
    };

    const items = await storage.getProfessionalProfiles(filters);
    return NextResponse.json(items);
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
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// CodeRabbit Audit Trigger
