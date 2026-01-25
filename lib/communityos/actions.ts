"use server";

import { db } from "@/server/db";
import { tenants } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";
import { isTenantAdmin } from "@/lib/communityos/tenant-context";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Result pattern for server actions
 */
export type ActionResult<T = any> =
    | { success: true; data: T }
    | { success: false; error: string };

// --- Validation Schemas ---

const impactStatSchema = z.array(z.object({
    label: z.string().min(1, "Label is required").max(100),
    value: z.string().min(1, "Value is required").max(50),
    icon: z.string().min(1, "Icon is required").max(50),
}));

const programSchema = z.array(z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    imageUrl: z.string().url().optional().or(z.literal("")),
    linkUrl: z.string().url().optional().or(z.literal("")),
}));

const teamMemberSchema = z.array(z.object({
    name: z.string().min(1, "Name is required").max(100),
    title: z.string().min(1, "Title is required").max(100),
    bio: z.string().max(1000).optional().or(z.literal("")),
    imageUrl: z.string().url().optional().or(z.literal("")),
    linkedinUrl: z.string().url().optional().or(z.literal("")),
}));

const gallerySchema = z.array(z.object({
    url: z.string().url("Valid image URL required"),
    caption: z.string().max(255).optional().or(z.literal("")),
}));

const testimonialSchema = z.array(z.object({
    quote: z.string().min(1, "Quote is required").max(1000),
    author: z.string().min(1, "Author is required").max(100),
    role: z.string().max(100).optional().or(z.literal("")),
    imageUrl: z.string().url().optional().or(z.literal("")),
}));

const ctaSchema = z.array(z.object({
    label: z.string().min(1, "Label is required").max(50),
    url: z.string().url("Valid URL required"),
    style: z.enum(['primary', 'secondary', 'outline']),
}));

const eventSchema = z.array(z.object({
    title: z.string().min(1, "Title is required").max(100),
    date: z.string().min(1, "Date is required"),
    location: z.string().min(1, "Location is required").max(255),
    url: z.string().url().optional().or(z.literal("")),
}));

const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const socialLinkValue = z.string().url().optional().nullable().or(z.literal(""));

const socialLinksSchema = z.object({
    facebook: socialLinkValue,
    instagram: socialLinkValue,
    twitter: socialLinkValue,
    youtube: socialLinkValue,
    soundcloud: socialLinkValue,
    bandcamp: socialLinkValue,
    linkedin: socialLinkValue,
    tiktok: socialLinkValue,
    spotify: socialLinkValue,
}).strict();

const profileSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    missionStatement: z.string().max(2000).optional().nullable(),
    logoUrl: z.string().url().max(1000).optional().nullable().or(z.literal("")),
    heroImageUrl: z.string().url().max(1000).optional().nullable().or(z.literal("")),
    primaryColor: z.string().regex(colorRegex, "Invalid color format").optional().nullable(),
    secondaryColor: z.string().regex(colorRegex, "Invalid color format").optional().nullable(),
    website: z.string().url().optional().nullable().or(z.literal("")),
    contactEmail: z.string().email().optional().nullable().or(z.literal("")),
    contactPhone: z.string().regex(/^[\d\s+\-()]+$/, "Invalid phone format").optional().nullable().or(z.literal("")),
    address: z.string().max(500).optional().nullable(),
    isPublic: z.boolean().optional(),
    socialLinks: socialLinksSchema.optional(),
});

/**
 * Helper to verify tenant admin access
 */
async function verifyAdmin(tenantId: string): Promise<ActionResult<{ userId: string }>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const isAdmin = await isTenantAdmin(user.id, tenantId);
        if (!isAdmin) {
            return { success: false, error: "Admin privileges required" };
        }

        return { success: true, data: { userId: user.id } };
    } catch (err) {
        console.error(`[verifyAdmin] error for tenant ${tenantId}:`, err);
        return { success: false, error: "Authorization check failed" };
    }
}

/**
 * Update basic tenant profile fields
 */
export async function updateTenantProfile(
    tenantId: string,
    profileData: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return auth;

    const result = profileSchema.safeParse(profileData);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    const validatedData = result.data;

    try {
        await db.update(tenants)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantProfile] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update profile" };
    }
}

/**
 * Update tenant impact statistics
 */
export async function updateTenantImpactStats(
    tenantId: string,
    stats: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return auth;

    const result = impactStatSchema.safeParse(stats);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                impactStats: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/impact`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantImpactStats] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update impact statistics" };
    }
}

/**
 * Update tenant programs and services
 */
export async function updateTenantPrograms(
    tenantId: string,
    programs: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return auth;

    const result = programSchema.safeParse(programs);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                programs: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantPrograms] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update programs" };
    }
}

/**
 * Update tenant team members
 */
export async function updateTenantTeam(
    tenantId: string,
    team: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return auth;

    const result = teamMemberSchema.safeParse(team);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                teamMembers: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/team`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantTeam] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update team members" };
    }
}

/**
 * Update tenant photo gallery
 */
export async function updateTenantGallery(
    tenantId: string,
    gallery: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    const result = gallerySchema.safeParse(gallery);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                gallery: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/gallery`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantGallery] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update gallery" };
    }
}

/**
 * Update tenant testimonials
 */
export async function updateTenantTestimonials(
    tenantId: string,
    testimonials: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    const result = testimonialSchema.safeParse(testimonials);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                testimonials: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/testimonials`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantTestimonials] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update testimonials" };
    }
}

/**
 * Update tenant CTA buttons
 */
export async function updateTenantCTAs(
    tenantId: string,
    ctas: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    const result = ctaSchema.safeParse(ctas);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                ctas: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/cta`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantCTAs] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update call-to-action buttons" };
    }
}

/**
 * Update tenant upcoming events
 */
export async function updateTenantEvents(
    tenantId: string,
    events: any
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    const result = eventSchema.safeParse(events);
    if (!result.success) {
        return { success: false, error: "Validation failed: " + result.error.errors[0].message };
    }

    try {
        await db.update(tenants)
            .set({
                events: result.data,
                updatedAt: new Date()
            })
            .where(eq(tenants.id, tenantId));

        revalidatePath(`/communityos/${tenantId}/settings/profile/events`);
        return { success: true, data: null };
    } catch (err) {
        console.error(`[updateTenantEvents] database error for tenant ${tenantId}:`, err);
        return { success: false, error: "Failed to update upcoming events" };
    }
}
