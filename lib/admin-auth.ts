import { createClient } from "./supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    // Bypass for automated auditing (if configured)
    const { headers } = await import("next/headers");
    const headerStore = await headers();
    const bypassToken = headerStore.get("x-admin-bypass-token");

    if (process.env.ADMIN_BYPASS_TOKEN && bypassToken === process.env.ADMIN_BYPASS_TOKEN) {
        console.log("[Admin Auth] Bypassing admin check with token.");
        return {
            id: "00000000-0000-0000-0000-000000000000",
            email: "audit@test.local",
            isAdmin: true,
            firstName: "Audit",
            lastName: "Bot"
        }; // Mock admin user
    }

    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("[Admin Auth] No authenticated user:", authError?.message);
        redirect("/login?next=/admin");
    }

    // Query user from database
    let dbUser;
    try {
        dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });
    } catch (dbError) {
        console.error("[Admin Auth] Database error querying user:", dbError);
        redirect("/dashboard?error=admin_check_failed");
    }

    if (!dbUser) {
        console.error("[Admin Auth] User not found in database:", user.id);
        // User might not have completed onboarding - their profile doesn't exist
        redirect("/onboarding?error=profile_not_found");
    }

    if (!dbUser.isAdmin) {
        console.error("[Admin Auth] User is not an admin:", user.id);
        redirect("/dashboard?error=unauthorized");
    }

    return dbUser;
}


export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return false;
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: { isAdmin: true },
        });

        return dbUser?.isAdmin ?? false;
    } catch (error) {
        console.error("[Admin Auth] Error checking isAdmin:", error);
        return false;
    }
}
