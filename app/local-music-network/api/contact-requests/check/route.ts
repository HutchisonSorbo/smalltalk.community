import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const recipientId = url.searchParams.get("recipientId");

        if (!recipientId) {
            return NextResponse.json({ message: "Recipient ID is required" }, { status: 400 });
        }

        const contactRequest = await storage.getContactRequest(user.id, recipientId);

        if (contactRequest) {
            return NextResponse.json({ status: contactRequest.status }, { status: 200 });
        }

        return NextResponse.json({ status: 'none' }, { status: 200 });

    } catch (error) {
        console.error("Error checking contact request:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
