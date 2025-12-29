import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertBandSchema } from "@shared/schema";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const band = await storage.getBand(params.id);
        if (!band) {
            return NextResponse.json({ message: "Band not found" }, { status: 404 });
        }
        return NextResponse.json(band);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const band = await storage.getBand(params.id);
        if (!band) {
            return NextResponse.json({ message: "Band not found" }, { status: 404 });
        }

        // Authorization: Owner or Admin Member
        const isOwner = band.userId === user.id;
        let isAdmin = false;
        if (!isOwner) {
            isAdmin = await storage.isBandAdmin(params.id, user.id);
        }

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const json = await request.json();
        // Validation with partial schema (insertBandSchema is strict, need partial)
        const partialSchema = insertBandSchema.omit({ userId: true }).partial();
        const parsed = partialSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const updatedBand = await storage.updateBand(params.id, parsed.data);
        return NextResponse.json(updatedBand);

    } catch (error) {
        console.error("Error updating band:", error);
        return NextResponse.json({ message: "Failed to update band" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
