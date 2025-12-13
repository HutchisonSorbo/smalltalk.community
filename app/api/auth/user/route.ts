import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Auth User API: Supabase getUser error:", error.message);
            return NextResponse.json({ message: "Unauthorized", error: error.message }, { status: 401 });
        }

        if (!user) {
            console.error("Auth User API: No user found in session");
            return NextResponse.json({ message: "Unauthorized - No Session" }, { status: 401 });
        }

        console.log("Auth User API: User found:", user.id, user.email);

        const dbUser = await storage.getUser(user.id);
        if (!dbUser) {
            console.log("Auth User API: User not in DB, creating...");
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

        console.log("Auth User API: Returning existing DB user");
        return NextResponse.json(dbUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
    }
}
