
import { storage } from "@/server/storage";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a promise in Next 15+
) {
    const resolvedParams = await params;
    const item = await storage.getClassified(resolvedParams.id);

    if (!item) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(item);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const item = await storage.getClassified(resolvedParams.id);

    if (!item) {
        return new NextResponse("Not Found", { status: 404 });
    }

    if (item.userId !== user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    await storage.deleteClassified(resolvedParams.id);
    return new NextResponse(null, { status: 204 });
}

// CodeRabbit Audit Trigger
