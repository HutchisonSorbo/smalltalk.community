
import { storage } from "@/server/storage";
import { insertClassifiedSchema } from "@shared/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const filters = {
        location: searchParams.get('location') || undefined,
        instrument: searchParams.get('instrument') || undefined,
        type: searchParams.get('type') || undefined,
        genre: searchParams.get('genre') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const items = await storage.getClassifieds(filters);
    return NextResponse.json(items);
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const parseResult = insertClassifiedSchema.safeParse({
            ...body,
            userId: user.id
        });

        if (!parseResult.success) {
            return NextResponse.json(parseResult.error, { status: 400 });
        }

        const item = await storage.createClassified(parseResult.data);
        return NextResponse.json(item);
    } catch (error) {
        console.error("Failed to create classified:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// CodeRabbit Audit Trigger
