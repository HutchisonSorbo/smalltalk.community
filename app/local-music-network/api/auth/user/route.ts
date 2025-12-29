import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles } from "@/lib/rbac";

async function handleUserMigration(existingUser: any, authUserId: string) {
    console.log(`Auth User API: ID mismatch. DB: ${existingUser.id}, Auth: ${authUserId}. Migrating...`);
    try {
        await storage.migrateUserId(existingUser.id, authUserId);
        const dbUser = await storage.getUser(authUserId);
        if (dbUser) {
            console.log("Auth User API: Migration successful");
            return dbUser;
        }
    } catch (error) {
        console.error("Auth User API: Migration failed:", error);
        throw error;
    }
    return undefined;
}

async function createNewUser(user: any) {
    console.log("Auth User API: User not in DB, creating...");
    return await storage.upsertUser({
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata.full_name?.split(' ')[0] || 'User',
        lastName: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: user.user_metadata.date_of_birth ? new Date(user.user_metadata.date_of_birth) : undefined,
        userType: user.user_metadata.user_type || 'musician',
        createdAt: new Date(),
    });
}

async function syncUserMetadata(dbUser: any, user: any) {
    const metadataType = user.user_metadata.user_type || 'musician';
    if (dbUser.userType !== metadataType) {
        console.log(`Auth User API: Syncing userType for ${user.email} from ${dbUser.userType} to ${metadataType}`);
        return await storage.upsertUser({
            ...dbUser,
            userType: metadataType,
            updatedAt: new Date(),
        });
    }
    return dbUser;
}

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
            const existingUser = await storage.getUserByEmail(user.email!);
            if (existingUser) {
                try {
                    dbUser = await handleUserMigration(existingUser, user.id);
                    if (!dbUser) {
                        // Should technically not happen if migration succeeds return valid user
                        throw new Error("Migration successful but user retrieval failed");
                    }
                    return NextResponse.json(dbUser);
                } catch (e: any) {
                    return NextResponse.json(
                        { message: "Failed to sync user identity", error: e.message || "Unknown error" },
                        { status: 500 }
                    );
                }
            } else {
                dbUser = await createNewUser(user);
                return NextResponse.json(dbUser);
            }
        }

        if (dbUser) {
            // Sync metadata if user exists
            dbUser = await syncUserMetadata(dbUser, user);
        } else {
            // Fallback if something went wrong and we still don't have a user
            return NextResponse.json({ message: "Failed to find or create user" }, { status: 500 });
        }

        console.log("Auth User API: Returning existing DB user");
        const roles = await getUserRoles(dbUser!.id);
        return NextResponse.json({ ...dbUser, roles });

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
