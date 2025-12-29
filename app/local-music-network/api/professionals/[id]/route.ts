
import { storage } from "@/server/storage";
import { insertProfessionalProfileSchema } from "@shared/schema";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const item = await storage.getProfessionalProfile(resolvedParams.id);

    if (!item) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(item);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const existing = await storage.getProfessionalProfile(resolvedParams.id);

    if (!existing) {
        return new NextResponse("Not Found", { status: 404 });
    }

    if (existing.userId !== user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    // Partial validation
    const parseResult = insertProfessionalProfileSchema.partial().safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json(parseResult.error, { status: 400 });
    }

    const updated = await storage.updateProfessionalProfile(resolvedParams.id, parseResult.data);
    return NextResponse.json(updated);
}

// CodeRabbit Audit Trigger
