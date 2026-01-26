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

export async function updateTenantProfile(tenantCode: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    const tenant = await getTenantByCode(tenantCode);
    if (!tenant) {
        return { error: "Tenant not found" };
    }

    const isAdmin = await isTenantAdmin(user.id, tenant.id);
    if (!isAdmin) {
        return { error: "Forbidden" };
    }

    // Parse form data
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

    const validated = updateTenantSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: "Validation error", details: validated.error.flatten() };
    }

    const {
        facebook,
        instagram,
        twitter,
        linkedin,
        youtube,
        ...fields
    } = validated.data;

    // Construct social links object
    // Merge with existing links just in case, but here we replace specific keys
    const currentSocials = (tenant.socialLinks as Record<string, string>) || {};
    const newSocials = {
        ...currentSocials,
        facebook: facebook || undefined,
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        linkedin: linkedin || undefined,
        youtube: youtube || undefined,
    };

    // Clean up undefined values from social links
    Object.keys(newSocials).forEach(key => {
        if (newSocials[key] === undefined) {
            delete newSocials[key];
        }
    });

    try {
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
        console.error("Error updating tenant:", error);
        return { error: "Failed to update profile" };
    }
}
