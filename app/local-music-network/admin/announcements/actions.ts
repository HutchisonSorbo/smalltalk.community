"use server";

import { db } from "@/server/db";
import { announcements } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(data: {
    message: string;
    visibility: "public" | "private" | "all";
    isActive: boolean;
    priority?: number;
}) {
    await requireAdmin();

    await db.insert(announcements).values({
        message: data.message,
        visibility: data.visibility,
        isActive: data.isActive,
        priority: data.priority || 0,
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/"); // Update home page as well
}

export async function deleteAnnouncement(id: string) {
    await requireAdmin();
    await db.delete(announcements).where(eq(announcements.id, id));
    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
    await requireAdmin();
    await db.update(announcements).set({ isActive }).where(eq(announcements.id, id));
    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

// CodeRabbit Audit Trigger
