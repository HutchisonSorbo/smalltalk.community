"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { badges, userBadges, portfolioItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Gets the authenticated user ID or throws if not authenticated
 */
async function getAuthenticatedUserId(): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorised");
    return user.id;
}

/**
 * Validates that the provided userId matches the authenticated user
 */
async function validateUser(userId: string): Promise<string> {
    const authUserId = await getAuthenticatedUserId();
    if (authUserId !== userId) {
        throw new Error("Unauthorised access to user data");
    }
    return authUserId;
}

/**
 * Fetches all badges earned by the current user
 */
export async function getUserBadges(userId: string) {
    try {
        await validateUser(userId);
        return await db
            .select({
                id: badges.id,
                name: badges.name,
                description: badges.description,
                imageUrl: badges.imageUrl,
                issuerId: badges.issuerId,
                criteria: badges.criteria,
                category: badges.category,
                issuedAt: userBadges.awardedAt,
                evidence: userBadges.evidenceUrl,
            })
            .from(userBadges)
            .innerJoin(badges, eq(userBadges.badgeId, badges.id))
            .where(eq(userBadges.userId, userId));
    } catch (error) {
        console.error("[getUserBadges] Error:", error);
        return [];
    }
}

/**
 * Fetches all portfolio items for the current user
 */
export async function getPortfolioItems(userId: string) {
    try {
        await validateUser(userId);
        return await db
            .select()
            .from(portfolioItems)
            .where(eq(portfolioItems.userId, userId));
    } catch (error) {
        console.error("[getPortfolioItems] Error:", error);
        return [];
    }
}

/**
 * Adds or updates a portfolio item
 */
export async function upsertPortfolioItem(userId: string, data: {
    id?: string;
    title: string;
    description: string;
    url?: string;
    type: string;
    mediaUrl?: string;
}) {
    try {
        const authUserId = await validateUser(userId);
        
        const values = {
            title: data.title,
            description: data.description,
            mediaUrl: data.url || data.mediaUrl,
            mediaType: data.type,
            updatedAt: new Date(),
        };

        if (data.id) {
            await db
                .update(portfolioItems)
                .set(values)
                .where(and(eq(portfolioItems.id, data.id), eq(portfolioItems.userId, authUserId)));
        } else {
            await db.insert(portfolioItems).values({
                ...values,
                userId: authUserId,
            });
        }
        revalidatePath("/volunteer-passport/profile");
        return { success: true };
    } catch (error) {
        console.error("[upsertPortfolioItem] Error:", error);
        return { success: false, error: "Failed to save portfolio item" };
    }
}

/**
 * Deletes a portfolio item
 */
export async function deletePortfolioItem(userId: string, itemId: string) {
    try {
        const authUserId = await validateUser(userId);
        await db
            .delete(portfolioItems)
            .where(and(eq(portfolioItems.id, itemId), eq(portfolioItems.userId, authUserId)));
        revalidatePath("/volunteer-passport/profile");
        return { success: true };
    } catch (error) {
        console.error("[deletePortfolioItem] Error:", error);
        return { success: false, error: "Failed to delete portfolio item" };
    }
}