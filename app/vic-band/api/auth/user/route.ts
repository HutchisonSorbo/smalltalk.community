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

        let dbUser = await storage.getUser(user.id);
        if (!dbUser) {
            // Check if user exists by email (handle ID mismatch scenario)
            const existingUser = await storage.getUserByEmail(user.email!);

            if (existingUser) {
                console.log(`Auth User API: ID mismatch for ${user.email}. DB: ${existingUser.id}, Auth: ${user.id}. Migrating...`);
                try {
                    await storage.migrateUserId(existingUser.id, user.id);
                    // Fetch the migrated user
                    dbUser = await storage.getUser(user.id);
                    if (dbUser) {
                        console.log("Auth User API: Migration successful");
                        return NextResponse.json(dbUser);
                    }
                } catch (error) {
                    console.error("Auth User API: Migration failed:", error);
                    return NextResponse.json(
                        { message: "Failed to sync user identity", error: error instanceof Error ? error.message : "Unknown error" },
                        { status: 500 }
                    );
                }
            }

            console.log("Auth User API: User not in DB, creating...");
            // Sync user from Supabase Auth to our database
            const newUser = await storage.upsertUser({
                id: user.id,
                email: user.email!,
                firstName: user.user_metadata.full_name?.split(' ')[0] || 'User',
                lastName: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
                dateOfBirth: user.user_metadata.date_of_birth ? new Date(user.user_metadata.date_of_birth) : undefined,
                userType: user.user_metadata.user_type || 'musician', // Added userType
                createdAt: new Date(),
            });
            return NextResponse.json(newUser);
        }

        if (dbUser) {
            // Check if userType needs syncing (e.g. was created without it or changed)
            const metadataType = user.user_metadata.user_type || 'musician';
            if (dbUser.userType !== metadataType) {
                console.log(`Auth User API: Syncing userType for ${user.email} from ${dbUser.userType} to ${metadataType}`);
                const updatedUser = await storage.upsertUser({
                    ...dbUser,
                    userType: metadataType,
                    updatedAt: new Date(),
                });
                dbUser = updatedUser;
            }
        }

        console.log("Auth User API: Returning existing DB user");
        return NextResponse.json(dbUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
    }
}
