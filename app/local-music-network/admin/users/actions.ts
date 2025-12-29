"use server";

import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export async function toggleAdminStatus(userId: string, isAdmin: boolean) {
    await requireAdmin();

    await db.update(users)
        .set({ isAdmin })
        .where(eq(users.id, userId));

    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    await db.delete(users)
        .where(eq(users.id, userId));

    revalidatePath("/admin/users");
}

// CodeRabbit Audit Trigger
