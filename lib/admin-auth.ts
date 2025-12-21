import { createClient } from "./supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    if (!dbUser || !dbUser.isAdmin) {
        redirect("/");
    }

    return dbUser;
}
