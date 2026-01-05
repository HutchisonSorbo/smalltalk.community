import { createClient } from "./supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    try {
        // Bypass for automated auditing (if configured)
        // Check for a specific header or cookie if feasible, but here we can only check headers request-side context if we have it?
        // Wait, requireAdmin is called in Server Components/Actions. We can use `headers()` from next/headers.
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
