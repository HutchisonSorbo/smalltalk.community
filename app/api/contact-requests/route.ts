import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertContactRequestSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { recipientId } = body;

        if (!recipientId) {
            return NextResponse.json({ message: "Recipient ID is required" }, { status: 400 });
        }

        // Check if request already exists
        const existingRequest = await storage.getContactRequest(user.id, recipientId);
        if (existingRequest) {
            return NextResponse.json({ message: "Request already sent", request: existingRequest }, { status: 200 });
        }

        // Validate using schema (partial validation as we construct the record)
        const newRequestData = {
            requesterId: user.id,
            recipientId,
            status: "pending",
        };

        const validatedData = insertContactRequestSchema.parse(newRequestData);

        const newRequest = await storage.createContactRequest(validatedData);

        // Notify Recipient
        // We need the musician profile to link correctly or just notify the user.
        // The recipientId in contact_requests matches the User ID of the musician?
        // Wait, schema says recipientId references users.id.
        // If the frontend passes musician.userId, that's correct.

        await storage.createNotification({
            userId: recipientId,
            type: 'contact_request',
            title: 'New Contact Request',
            message: 'A user wants to view your contact information.',
            metadata: { requestId: newRequest.id },
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating contact request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
