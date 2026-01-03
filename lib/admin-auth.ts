import { createClient } from "./supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.error("[Admin Auth] No authenticated user:", error?.message);
            redirect("/login?next=/admin");
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser) {
            console.error("[Admin Auth] User not found in database:", user.id);
            redirect("/login?next=/admin");
        }

        if (!dbUser.isAdmin) {
            console.error("[Admin Auth] User is not an admin:", user.id);
            redirect("/dashboard?error=unauthorized");
        }

        return dbUser;
    } catch (error) {
        console.error("[Admin Auth] Error checking admin status:", error);
        // Redirect to dashboard with error instead of crashing
        redirect("/dashboard?error=admin_check_failed");
    }
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
