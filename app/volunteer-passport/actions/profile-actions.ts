"use server";

import { db } from "@/server/db";
import { badges, userBadges, portfolioItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Fetches all badges earned by the current user
 */
export async function getUserBadges(userId: string) {
    try {
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
        if (data.id) {
            await db
                .update(portfolioItems)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(portfolioItems.id, data.id), eq(portfolioItems.userId, userId)));
        } else {
            await db.insert(portfolioItems).values({
                userId,
                title: data.title,
                description: data.description,
                url: data.url,
                type: data.type,
                mediaUrl: data.mediaUrl,
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
        await db
            .delete(portfolioItems)
            .where(and(eq(portfolioItems.id, itemId), eq(portfolioItems.userId, userId)));
        revalidatePath("/volunteer-passport/profile");
        return { success: true };
    } catch (error) {
        console.error("[deletePortfolioItem] Error:", error);
        return { success: false, error: "Failed to delete portfolio item" };
    }
}
