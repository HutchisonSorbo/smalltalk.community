"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { getTenantByCode, isTenantAdmin } from "@/lib/communityos/tenant-context";
import { z } from "zod";

// Schema for validation
const updateTenantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    missionStatement: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    contactEmail: z.string().email().optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color code").optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
});

/**
 * Parses and validates tenant form data.
 */
function parseTenantFormData(formData: FormData) {
    const rawData = {
        name: formData.get("name")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        missionStatement: formData.get("missionStatement")?.toString() || "",
        website: formData.get("website")?.toString() || "",
        contactEmail: formData.get("contactEmail")?.toString() || "",
        contactPhone: formData.get("contactPhone")?.toString() || "",
        address: formData.get("address")?.toString() || "",
        primaryColor: formData.get("primaryColor")?.toString() || "",
        facebook: formData.get("facebook")?.toString() || "",
        instagram: formData.get("instagram")?.toString() || "",
        twitter: formData.get("twitter")?.toString() || "",
        linkedin: formData.get("linkedin")?.toString() || "",
        youtube: formData.get("youtube")?.toString() || "",
    };

    return updateTenantSchema.safeParse(rawData);
}

/**
 * Merges existing social links with new ones from the form.
 */
function mergeSocialLinks(existingSocials: Record<string, string>, newSocialsData: Record<string, string | undefined>) {
    const merged = { ...existingSocials, ...newSocialsData };

    // Remove undefined values
    Object.keys(merged).forEach(key => {
        if (merged[key] === undefined) delete merged[key];
    });

    return merged;
}

/**
 * Updates a tenant's profile with new data.
 * 
 * @param {string} tenantCode The tenant's unique URL code (slug).
 * @param {FormData} formData The form data containing profile updates.
 * @returns {Promise<{ success?: boolean; error?: string; details?: any }>} Result object indicating success or failure.
 * 
 * Side Effects:
 * - Updates the `tenants` table in the database.
 * - Revalidates the public profile page cache.
 */
export async function updateTenantProfile(tenantCode: string, formData: FormData): Promise<{ success?: boolean; error?: string; details?: any }> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return { error: "Unauthorized" };

        const tenant = await getTenantByCode(tenantCode);
        if (!tenant) return { error: "Tenant not found" };

        const isAdmin = await isTenantAdmin(user.id, tenant.id);
        if (!isAdmin) return { error: "Forbidden" };

        const validated = parseTenantFormData(formData);
        if (!validated.success) {
            return { error: "Validation error", details: validated.error.flatten() };
        }

        const { facebook, instagram, twitter, linkedin, youtube, ...fields } = validated.data;

        const newSocials = mergeSocialLinks(
            (tenant.socialLinks as Record<string, string>) || {},
            { facebook: facebook || undefined, instagram: instagram || undefined, twitter: twitter || undefined, linkedin: linkedin || undefined, youtube: youtube || undefined }
        );

        const { error } = await supabase
            .from("tenants")
            .update({
                name: fields.name,
                description: fields.description || null,
                mission_statement: fields.missionStatement || null,
                website: fields.website || null,
                contact_email: fields.contactEmail || null,
                contact_phone: fields.contactPhone || null,
                address: fields.address || null,
                primary_color: fields.primaryColor || null,
                social_links: newSocials,
                updated_at: new Date().toISOString(),
            })
            .eq("id", tenant.id);

        if (error) throw error;

        revalidatePath(`/org/${tenantCode}`);
        return { success: true };
    } catch (error) {
        console.error(`[updateTenantProfile] Error updating tenant ${tenantCode}:`, error);
        return { error: "Failed to update profile" };
    }
}
