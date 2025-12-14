import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertMusicianProfileSchema } from "@shared/schema";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const profile = await storage.getMusicianProfile(params.id);
        if (!profile) {
            return NextResponse.json({ message: "Musician not found" }, { status: 404 });
        }

        // Get user info for messaging
        const user = await storage.getUser(profile.userId);

        // V-01 REMEDIATION: Sanitize user object to prevent PII leak (email)
        let publicUser = null;
        if (user) {
            const { email, ...safeUser } = user;
            publicUser = safeUser;
        }

        return NextResponse.json({ ...profile, user: publicUser });
    } catch (error) {
        console.error("Error fetching musician:", error);
        return NextResponse.json({ message: "Failed to fetch musician" }, { status: 500 });
    }
}

export async function PUT(
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

        const existing = await storage.getMusicianProfile(params.id);

        if (!existing) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const json = await request.json();
        const parsed = insertMusicianProfileSchema.partial().safeParse(json);

        if (parsed.success) {
            console.log("Updating profile", params.id, "with data:", JSON.stringify(parsed.data, null, 2));
        }

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        // Strip userId and id to prevent ownership reassignment
        const { userId: _, id: __, ...safeData } = parsed.data as any;
        const updated = await storage.updateMusicianProfile(params.id, safeData);

        // Sync to users table for header display if name or image changed
        if (updated && (safeData.name || safeData.profileImageUrl)) {
            const nameToUse = safeData.name || existing.name;
            const imageToUse = safeData.profileImageUrl !== undefined ? safeData.profileImageUrl : existing.profileImageUrl;

            const nameParts = nameToUse.split(' ');
            await storage.upsertUser({
                id: user.id,
                email: user.email!,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') || '',
                profileImageUrl: imageToUse,
            });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating musician profile:", error);
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}

export async function DELETE(
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

        const existing = await storage.getMusicianProfile(params.id);

        if (!existing) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        await storage.deleteMusicianProfile(params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting musician profile:", error);
        return NextResponse.json({ message: "Failed to delete profile" }, { status: 500 });
    }
}
