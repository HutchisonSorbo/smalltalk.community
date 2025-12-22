import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        const musicianId = params.id;
        const musicianProfile = await storage.getMusicianProfile(musicianId);

        if (!musicianProfile) {
            return NextResponse.json({ message: "Musician not found" }, { status: 404 });
        }

        // Default access: If Public, everyone can view
        if (musicianProfile.isContactInfoPublic) {
            return NextResponse.json({ status: 'none', canView: true });
        }

        // If not logged in, cannot view private info
        if (error || !user) {
            return NextResponse.json({ status: 'none', canView: false });
        }

        // Owner can always view
        if (musicianProfile.userId === user.id) {
            return NextResponse.json({ status: 'none', canView: true });
        }

        // Check request status
        const requestStatus = await storage.getContactRequest(user.id, musicianProfile.userId);

        if (requestStatus) {
            return NextResponse.json({
                status: requestStatus.status,
                canView: requestStatus.status === 'accepted'
            });
        }

        return NextResponse.json({ status: 'none', canView: false });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
