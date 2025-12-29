import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { insertMessageSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const senderId = user.id;

        // Validate with Zod
        const validatedData = insertMessageSchema.parse({
            ...json,
            senderId,
        });

        // Verify receiver exists
        const receiver = await storage.getUser(validatedData.receiverId);
        if (!receiver) {
            return NextResponse.json({ message: "Recipient not found" }, { status: 404 });
        }

        // Can't message yourself
        if (senderId === validatedData.receiverId) {
            return NextResponse.json({ message: "Cannot send message to yourself" }, { status: 400 });
        }

        const message = await storage.sendMessage(validatedData);
        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            const firstError = error.errors?.[0]?.message || "Invalid message data";
            return NextResponse.json({ message: firstError }, { status: 400 });
        }
        console.error("Error sending message:", error);
        return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
