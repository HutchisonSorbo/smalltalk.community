import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertBandMemberSchema } from "@shared/schema";
import { z } from "zod";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const members = await storage.getBandMembers(params.id);
        return NextResponse.json(members);
    } catch (error) {
        console.error("Error fetching band members:", error);
        return NextResponse.json({ message: "Failed to fetch members" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Check Permissions (Owner or Admin)
        const isAdmin = await storage.isBandAdmin(params.id, user.id);
        if (!isAdmin) {
            return NextResponse.json({ message: "Not authorized to manage members" }, { status: 403 });
        }

        const json = await request.json();

        // Validation: email is required to add a member
        if (!json.email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const targetUser = await storage.getUserByEmail(json.email);
        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if already a member
        const members = await storage.getBandMembers(params.id);
        if (members.some(m => m.userId === targetUser.id)) {
            return NextResponse.json({ message: "User is already a member" }, { status: 400 });
        }

        const newMember = await storage.addBandMember({
            bandId: params.id,
            userId: targetUser.id,
            role: json.role === 'admin' ? 'admin' : 'member',
            instrument: json.instrument || '',
        });

        return NextResponse.json(newMember, { status: 201 });

    } catch (error) {
        console.error("Error adding band member:", error);
        return NextResponse.json({ message: "Failed to add member" }, { status: 500 });
    }
}
