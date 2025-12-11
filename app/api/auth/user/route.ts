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

        const dbUser = await storage.getUser(user.id);
        if (!dbUser) {
            // Sync user from Supabase Auth to our database
            const newUser = await storage.upsertUser({
                id: user.id,
                email: user.email!,
                firstName: user.user_metadata.full_name?.split(' ')[0] || 'User',
                lastName: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
                dateOfBirth: user.user_metadata.date_of_birth ? new Date(user.user_metadata.date_of_birth) : undefined,
                createdAt: new Date(),
            });
            return NextResponse.json(newUser);
        }

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
    }
}
