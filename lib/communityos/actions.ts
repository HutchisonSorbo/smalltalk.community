"use server";

import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-service";
import { isTenantAdmin } from "@/lib/communityos/tenant-context";
import { revalidatePath } from "next/cache";
import type { Tenant } from "@/shared/schema";

/**
 * Result pattern for server actions
 */
export type ActionResult<T = any> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Helper to verify tenant admin access
 */
async function verifyAdmin(tenantId: string): Promise<{ success: boolean; userId?: string; error?: string }> {
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

        return { success: true, userId: user.id };
    } catch (err) {
        console.error("[verifyAdmin] error:", err);
        return { success: false, error: "Access verification failed" };
    }
}

/**
 * Update basic tenant profile fields
 */
export async function updateTenantProfile(
    tenantId: string,
    profileData: Partial<Pick<Tenant, "name" | "description" | "missionStatement" | "logoUrl" | "heroImageUrl" | "primaryColor" | "secondaryColor" | "website" | "contactEmail" | "contactPhone" | "address" | "isPublic" | "socialLinks">>
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();

        // Map camelCase to snake_case for Supabase client
        const dbData: any = {};
        if (profileData.name !== undefined) dbData.name = profileData.name;
        if (profileData.description !== undefined) dbData.description = profileData.description;
        if (profileData.missionStatement !== undefined) dbData.mission_statement = profileData.missionStatement;
        if (profileData.logoUrl !== undefined) dbData.logo_url = profileData.logoUrl;
        if (profileData.heroImageUrl !== undefined) dbData.hero_image_url = profileData.heroImageUrl;
        if (profileData.primaryColor !== undefined) dbData.primary_color = profileData.primaryColor;
        if (profileData.secondaryColor !== undefined) dbData.secondary_color = profileData.secondaryColor;
        if (profileData.website !== undefined) dbData.website = profileData.website;
        if (profileData.contactEmail !== undefined) dbData.contact_email = profileData.contactEmail;
        if (profileData.contactPhone !== undefined) dbData.contact_phone = profileData.contactPhone;
        if (profileData.address !== undefined) dbData.address = profileData.address;
        if (profileData.isPublic !== undefined) dbData.is_public = profileData.isPublic;
        if (profileData.socialLinks !== undefined) dbData.social_links = profileData.socialLinks;

        dbData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from("tenants")
            .update(dbData)
            .eq("id", tenantId);

        if (error) {
            console.error("[updateTenantProfile] db error:", error);
            return { success: false, error: "Failed to update profile" };
        }

        revalidatePath(`/communityos/${tenantId}/settings/profile`);
        return { success: true, data: null };
    } catch (err) {
        console.error("[updateTenantProfile] unexpected error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant impact statistics
 */
export async function updateTenantImpactStats(
    tenantId: string,
    stats: Tenant["impactStats"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                impact_stats: stats,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update impact statistics" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/impact`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant programs and services
 */
export async function updateTenantPrograms(
    tenantId: string,
    programs: Tenant["programs"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                programs: programs,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update programs" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/programs`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant team members
 */
export async function updateTenantTeam(
    tenantId: string,
    team: Tenant["teamMembers"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                team_members: team,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update team" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/team`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant photo gallery
 */
export async function updateTenantGallery(
    tenantId: string,
    gallery: Tenant["gallery"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                gallery_images: gallery,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update gallery" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/gallery`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant testimonials
 */
export async function updateTenantTestimonials(
    tenantId: string,
    testimonials: Tenant["testimonials"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                testimonials: testimonials,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update testimonials" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/testimonials`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant CTA buttons
 */
export async function updateTenantCTAs(
    tenantId: string,
    ctas: Tenant["ctas"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                cta_buttons: ctas,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update call-to-action buttons" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/cta`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Update tenant upcoming events
 */
export async function updateTenantEvents(
    tenantId: string,
    events: Tenant["events"]
): Promise<ActionResult> {
    const auth = await verifyAdmin(tenantId);
    if (!auth.success) return { success: false, error: auth.error! };

    try {
        const supabase = createServiceClient();
        const { error } = await supabase
            .from("tenants")
            .update({
                upcoming_events: events,
                updated_at: new Date().toISOString()
            })
            .eq("id", tenantId);

        if (error) return { success: false, error: "Failed to update upcoming events" };

        revalidatePath(`/communityos/${tenantId}/settings/profile/events`);
        return { success: true, data: null };
    } catch (err) {
        return { success: false, error: "An unexpected error occurred" };
    }
}
