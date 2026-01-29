"use server";

import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { badges, userBadges, portfolioItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Custom error class for user-safe validation or authorisation errors.
 * These messages are safe to display to the end-user.
 */
class UserSafeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserSafeError";
    }
}

/**
 * Validation schema for portfolio items
 */
const portfolioItemSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(255, "Title is too long (max 255 characters)"),
    description: z.string().trim().max(2000, "Description is too long (max 2000 characters)").optional(),
    type: z.enum(["link", "document", "media"], {
        errorMap: () => ({ message: "Invalid media type" }),
    }),
    url: z.string().url("Invalid URL format").optional().or(z.literal("")),
    mediaUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

/**
 * Gets the authenticated user ID or throws if not authenticated
 */
async function getAuthenticatedUserId(): Promise<string> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new UserSafeError("Unauthorised");
        }
        return user.id;
    } catch (error) {
        if (error instanceof UserSafeError) throw error;
        console.error("[getAuthenticatedUserId] Failed:", error);
        throw new Error("Internal authentication failure");
    }
}

/**
 * Validates that the provided userId matches the authenticated user
 */
async function validateUser(userId: string): Promise<string> {
    try {
        const authUserId = await getAuthenticatedUserId();
        if (authUserId !== userId) {
            throw new UserSafeError("Unauthorised access to user data");
        }
        return authUserId;
    } catch (error) {
        if (error instanceof UserSafeError) throw error;
        console.error(`[validateUser] Failed for userId=${userId}:`, error);
        throw new Error("Internal validation failure");
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

        // Input validation and sanitisation using Zod
        const validationResult = portfolioItemSchema.safeParse(data);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.issues[0]?.message || "Invalid input";
            throw new UserSafeError(errorMessage);
        }

        const validatedData = validationResult.data;

        // Normalise and further validate the URL protocol
        let validatedMediaUrl: string | undefined;
        const rawUrl = validatedData.url || validatedData.mediaUrl;

        if (rawUrl) {
            try {
                const parsedUrl = new URL(rawUrl);
                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new UserSafeError("Unsafe URL protocol");
                }
                validatedMediaUrl = parsedUrl.toString();
            } catch (err) {
                const message = err instanceof UserSafeError ? err.message : "Invalid URL format";
                throw new UserSafeError(message);
            }
        }

        const values = {
            title: validatedData.title,
            description: validatedData.description || null,
            mediaUrl: validatedMediaUrl || null,
            mediaType: validatedData.type,
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
        
        const message = error instanceof UserSafeError 
            ? error.message 
            : "Something went wrong. Please try again.";
            
        return {
            success: false,
            error: message
        };
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
        
        const message = error instanceof UserSafeError 
            ? error.message 
            : "Something went wrong. Please try again.";
            
        return {
            success: false,
            error: message
        };
    }
}