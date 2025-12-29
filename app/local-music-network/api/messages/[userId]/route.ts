import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(
    request: Request,
    props: { params: Promise<{ userId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = user.id;
        const otherUserId = params.userId;

        // Get the other user to validate they exist
        const otherUser = await storage.getUser(otherUserId);
        if (!otherUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Mark messages as read
        await storage.markMessagesAsRead(currentUserId, otherUserId);

        // Get all messages in conversation
        const messages = await storage.getConversation(currentUserId, otherUserId);

        // V-02 REMEDIATION: Sanitize user object to prevent PII leak (email)
        let publicUser = null;
        if (otherUser) {
            const { email, ...safeUser } = otherUser;
            publicUser = safeUser;
        }

        return NextResponse.json({ messages, otherUser: publicUser });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json({ message: "Failed to fetch conversation" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
