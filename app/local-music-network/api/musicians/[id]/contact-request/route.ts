import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const musicianId = params.id;
        const musicianProfile = await storage.getMusicianProfile(musicianId);

        if (!musicianProfile) {
            return NextResponse.json({ message: "Musician not found" }, { status: 404 });
        }

        const recipientUserId = musicianProfile.userId;

        // Prevent self-request
        if (recipientUserId === user.id) {
            return NextResponse.json({ message: "Cannot request your own contact info" }, { status: 400 });
        }

        // Check if request already exists
        const existingRequest = await storage.getContactRequest(user.id, recipientUserId);
        if (existingRequest) {
            return NextResponse.json({ message: "Request already sent", status: existingRequest.status });
        }

        // Create Request
        const newRequest = await storage.createContactRequest({
            requesterId: user.id,
            recipientId: recipientUserId,
            status: 'pending',
        });

        // Notify Recipient
        let userName = user.email; // Fallback
        // Try to get requester name from their musician profile if exists, or user table
        const requesterProfile = (await storage.getMusicianProfilesByUser(user.id))[0];
        if (requesterProfile) {
            userName = requesterProfile.name;
        } else if (user.user_metadata?.first_name) {
            userName = `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`;
        }

        await storage.createNotification({
            userId: recipientUserId,
            type: 'contact_request',
            title: 'New Contact Request',
            message: `${userName} wants to view your contact details.`,
            metadata: { requestId: newRequest.id, requesterId: user.id },
        });

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error("Error creating contact request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
