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

        const requestId = params.id;
        const { status } = await request.json();

        if (!['accepted', 'declined'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const contactRequest = await storage.getContactRequestById(requestId);
        if (!contactRequest) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        // Verify ownership (only Recipient can respond)
        if (contactRequest.recipientId !== user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Update status
        await storage.updateContactRequestStatus(requestId, status);

        // Notify Requester
        if (status === 'accepted') {
            await storage.createNotification({
                userId: contactRequest.requesterId,
                type: 'request_accepted',
                title: 'Contact Request Accepted',
                message: 'You can now view the contact details.',
                link: `/musicians/${(await storage.getMusicianProfilesByUser(user.id))[0]?.id}`, // Link back to profile
            });
        } else {
            // Optional: Notify declined? Maybe not to avoid spam/negativity, but user specified "accept or decline"
            // Let's notify declined so they know.
            await storage.createNotification({
                userId: contactRequest.requesterId,
                type: 'system',
                title: 'Contact Request Declined',
                message: 'Your request to view contact details was declined.',
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error responding to request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
