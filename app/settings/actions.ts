"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserPreference } from "@/shared/schema";

export async function updatePreferences(data: Partial<UserPreference>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            ...data,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("[updatePreferences] Error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
}

export async function getMFAFactors() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
        console.error("[getMFAFactors] Error:", error);
        return { factors: [], error: error.message };
    }

    return { factors: data.all };
}

export async function enrollMFA() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'smalltalk.community'
    });

    if (error) {
        console.error("[enrollMFA] Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function verifyMFAEnrollment(factorId: string, code: string) {
    const supabase = await createClient();

    // 1. Create a challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
    });

    if (challengeError) {
        return { success: false, error: challengeError.message };
    }

    // 2. Verify the challenge
    const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
    });

    if (error) {
        return { success: false, error: error.message };
    }

    await logActivity("mfa_enabled", "Two-factor authentication was successfully enabled.");

    revalidatePath("/settings/security");
    return { success: true, data };
}

export async function unenrollMFA(factorId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.unenroll({
        factorId
    });

    if (error) {
        return { success: false, error: error.message };
    }

    await logActivity("mfa_disabled", "Two-factor authentication was disabled.");

    revalidatePath("/settings/security");
    return { success: true, data };
}

export async function logoutOtherSessions() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: 'others' });

    if (error) {
        return { success: false, error: error.message };
    }

    await logActivity("logout_others", "Logged out from all other devices and sessions.");

    revalidatePath("/settings/security");
    return { success: true };
}

export async function logoutAllSessions() {
    const supabase = await createClient();

    // Log activity BEFORE signing out to ensure current user context is available
    await logActivity("logout_global", "Global logout initiated from security settings.");

    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
        return { success: false, error: error.message };
    }

    redirect("/login");
}

export async function logActivity(eventType: string, description: string, metadata: any = {}) {
    const supabase = await createClient(true); // System access to log
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        event_type: eventType,
        description,
        metadata,
    });

    if (error) {
        console.error(`[logActivity] Failed to insert log for user ${user.id} (${eventType}):`, error.message, {
            description,
            metadata
        });
    }
}

export async function getUserPreferences(userId: string): Promise<UserPreference | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        // Only attempt to insert defaults if the error is "not found" (PGRST116)
        if (error.code === 'PGRST116') {
            const { data: newData, error: createError } = await supabase
                .from("user_preferences")
                .insert({ user_id: userId })
                .select()
                .single();

            if (createError) {
                console.error("[getUserPreferences] Create error:", createError);
                return null;
            }
            return newData as UserPreference;
        }

        console.error("[getUserPreferences] Query error:", error);
        return null;
    }

    if (!data) return null;
    return data as UserPreference;
}
