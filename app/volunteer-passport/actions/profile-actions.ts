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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorised");
        return user.id;
    } catch (error) {
        console.error("[getAuthenticatedUserId] Failed:", error);
        throw error;
    }
}

/**
 * Validates that the provided userId matches the authenticated user
 */
async function validateUser(userId: string): Promise<string> {
    try {
        const authUserId = await getAuthenticatedUserId();
        if (authUserId !== userId) {
            throw new Error("Unauthorised access to user data");
        }
        return authUserId;
    } catch (error) {
        console.error(`[validateUser] Failed for userId=${userId}:`, error);
        throw error;
    }
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
 * Adds or updates a portfolio item with input validation and sanitisation
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

        // Input validation and sanitisation
        const title = data.title?.trim();
        if (!title) throw new Error("Title is required");
        if (title.length > 255) throw new Error("Title is too long (max 255 characters)");

        const description = data.description?.trim();
        if (description && description.length > 2000) throw new Error("Description is too long (max 2000 characters)");

        const allowedTypes = new Set(["link", "document", "media"]);
        if (!allowedTypes.has(data.type)) throw new Error("Invalid media type");

        let validatedMediaUrl: string | undefined;
        // Normalise and validate the URL
        const rawUrl = data.url || data.mediaUrl;
        if (rawUrl) {
            try {
                const parsedUrl = new URL(rawUrl);
                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Unsafe URL protocol");
                }
                validatedMediaUrl = parsedUrl.toString();
            } catch {
                throw new Error("Invalid URL format");
            }
        }

        const authUserId = await validateUser(userId);

        const values = {
            title,
            description,
            mediaUrl: validatedMediaUrl,
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
        return { success: false, error: error instanceof Error ? error.message : "Failed to save portfolio item" };
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