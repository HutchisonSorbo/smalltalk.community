"use server";

import { db } from "@/server/db";
import { gigs, gigManagers, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // Re-fetch internal user ID if needed, but we assume Supabase auth ID syncs or we used it.
    // Schema uses varchar IDs. If using Supabase IDs, direct match.
    // If not, we'd query `users` table by email or Supabase ID.
    return user;
}

export async function getGig(id: string) {
    const gig = await db.query.gigs.findFirst({
        where: eq(gigs.id, id),
        with: {
            creator: true,
            band: true,
            musician: true,
            managers: {
                with: {
                    user: true
                }
            }
        }
    });
    return gig;
}

export async function checkGigPermission(gigId: string, userId: string) {
    const gig = await db.query.gigs.findFirst({
        where: eq(gigs.id, gigId),
        with: {
            managers: true
        }
    });
    if (!gig) return false;

    if (gig.creatorId === userId) return true;
    if (gig.managers.some((m: any) => m.userId === userId)) return true;

    return false;
}

export async function updateGig(gigId: string, data: Partial<typeof gigs.$inferInsert>) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const canEdit = await checkGigPermission(gigId, user.id);
    if (!canEdit) throw new Error("Permission denied");

    // Whitelist fields to update
    const updateData = {
        title: data.title,
        date: data.date ? new Date(data.date) : undefined,
        location: data.location,
        description: data.description,
        genre: data.genre,
        price: data.price,
        ticketUrl: data.ticketUrl,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        updatedAt: new Date(),
    };

    await db.update(gigs)
        .set(updateData)
        .where(eq(gigs.id, gigId));

    return { success: true };
}

export async function addGigManager(gigId: string, email: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const canEdit = await checkGigPermission(gigId, user.id);
    if (!canEdit) throw new Error("Permission denied");

    // Find the user to add
    const userToAdd = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!userToAdd) throw new Error("User with this email not found");

    // Check if already manager
    const existing = await db.query.gigManagers.findFirst({
        where: and(
            eq(gigManagers.gigId, gigId),
            eq(gigManagers.userId, userToAdd.id)
        )
    });

    if (existing) throw new Error("User is already a manager");
    if (userToAdd.id === user.id) throw new Error("You are already the creator/manager");

    await db.insert(gigManagers).values({
        gigId,
        userId: userToAdd.id
    });

    return { success: true };
}

export async function removeGigManager(gigId: string, managerId: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const canEdit = await checkGigPermission(gigId, user.id);
    if (!canEdit) throw new Error("Permission denied");

    await db.delete(gigManagers)
        .where(and(
            eq(gigManagers.gigId, gigId),
            eq(gigManagers.userId, managerId)
        ));

    return { success: true };
}

// CodeRabbit Audit Trigger
