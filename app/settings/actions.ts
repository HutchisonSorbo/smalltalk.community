"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserPreference } from "@/shared/schema";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Updates the current user's preferences.
 * @param data - Partial preferences data to update (theme, language, highContrast, reducedMotion).
 * @returns An object indicating success or an error message.
 */
export async function updatePreferences(data: Partial<UserPreference>) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Sanitize and validate payload
        const ALLOWED_THEMES = ["light", "dark", "system"];
        const ALLOWED_LANGUAGES = ["en-AU", "en-GB", "en-US"];
        const sanitizedData: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            if (key === "theme") {
                const val = (value as string)?.trim().toLowerCase();
                if (ALLOWED_THEMES.includes(val)) {
                    sanitizedData.theme = val;
                } else {
                    console.error("[updatePreferences] Validation Error: Invalid theme", { val });
                    return { success: false, error: "Invalid preferences" };
                }
            } else if (key === "language") {
                const val = (value as string)?.trim();
                if (ALLOWED_LANGUAGES.includes(val)) {
                    sanitizedData.language = val;
                } else {
                    console.error("[updatePreferences] Validation Error: Invalid language", { val });
                    return { success: false, error: "Invalid preferences" };
                }
            } else if (key === "highContrast") {
                sanitizedData.highContrast = Boolean(value);
            } else if (key === "reducedMotion") {
                sanitizedData.reducedMotion = Boolean(value);
            }
        }

        if (Object.keys(sanitizedData).length === 0) {
            return { success: true }; // Nothing to update
        }

        const { error } = await supabase
            .from("user_preferences")
            .upsert({
                ...sanitizedData,
                user_id: user.id,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("[updatePreferences] Database Error:", error);
            return { success: false, error: "Unable to update preferences at this time" };
        }

        revalidatePath("/settings");
        return { success: true };
    } catch (err) {
        console.error("[updatePreferences] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Retrieves the MFA factors for the current user.
 * @returns An object containing the list of factors or an error message.
 */
export async function getMFAFactors() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.mfa.listFactors();

        if (error) {
            console.error("[getMFAFactors] Auth Error:", error);
            return { factors: [], error: "Unable to retrieve security factors" };
        }

        return { factors: data.all };
    } catch (err) {
        console.error("[getMFAFactors] Unexpected Error:", err);
        return { factors: [], error: "An unexpected error occurred" };
    }
}

/**
 * Initiates the enrollment process for a new TOTP MFA factor.
 * @returns An object containing success status and enrollment data or an error message.
 */
export async function enrollMFA() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'smalltalk.community'
        });

        if (error) {
            console.error("[enrollMFA] Enrollment Error:", error);
            return { success: false, error: "Unable to start enrollment at this time" };
        }

        return { success: true, data };
    } catch (err) {
        console.error("[enrollMFA] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Verifies a challenge for a new MFA factor to complete enrollment.
 * @param factorId - The ID of the factor being enrolled.
 * @param code - The verification code from the authenticator app.
 * @returns An object indicating success and verification data or an error message.
 */
export async function verifyMFAEnrollment(factorId: string, code: string) {
    if (!factorId?.trim() || !code?.trim()) {
        console.warn("[verifyMFAEnrollment] Missing or invalid factorId or code");
        return { success: false, error: "Missing or invalid factorId/code" };
    }

    try {
        const supabase = await createClient();

        // 1. Create a challenge
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId
        });

        if (challengeError) {
            console.error("[verifyMFAEnrollment] Challenge Error:", challengeError);
            return { success: false, error: "Verification challenge failed" };
        }

        // 2. Verify the challenge
        const { data, error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeData.id,
            code
        });

        if (error) {
            console.error("[verifyMFAEnrollment] Verification Error:", error);
            return { success: false, error: "Invalid verification code provided" };
        }

        await logActivity("mfa_enabled", "Two-factor authentication was successfully enabled.");

        revalidatePath("/settings/security");
        return { success: true, data };
    } catch (err) {
        console.error("[verifyMFAEnrollment] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred during verification" };
    }
}

/**
 * Unenrolls an existing MFA factor.
 * @param factorId - The ID of the factor to remove.
 * @returns An object indicating success and data or an error message.
 */
export async function unenrollMFA(factorId: string) {
    if (!factorId?.trim()) {
        console.error("[unenrollMFA] Missing factorId");
        return { success: false, error: "Missing or invalid factorId" };
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.mfa.unenroll({
            factorId
        });

        if (error) {
            console.error("[unenrollMFA] Unenroll Error:", error);
            return { success: false, error: "Unable to disable 2FA at this time" };
        }

        await logActivity("mfa_disabled", "Two-factor authentication was disabled.");

        revalidatePath("/settings/security");
        return { success: true, data };
    } catch (err) {
        console.error("[unenrollMFA] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Signs out the user from all other active sessions except the current one.
 * @returns An object indicating success or an error message.
 */
export async function logoutOtherSessions() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut({ scope: 'others' });

        if (error) {
            console.error("[logoutOtherSessions] SignOut Error:", error);
            return { success: false, error: "Unable to sign out other sessions" };
        }

        await logActivity("logout_others", "Logged out from all other devices and sessions.");

        revalidatePath("/settings/security");
        return { success: true };
    } catch (err) {
        console.error("[logoutOtherSessions] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Signs out the user from all active sessions globally.
 * @returns An object indicating success or an error message (if it fails before redirect).
 */
export async function logoutAllSessions() {
    let shouldRedirect = false;
    try {
        const supabase = await createClient();

        // Log activity BEFORE signing out to ensure current user context is available
        await logActivity("logout_global", "Global logout initiated from security settings.");

        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
            console.error("[logoutAllSessions] SignOut Error:", error);
            return { success: false, error: "Unable to sign out globally" };
        }
        shouldRedirect = true;
    } catch (err) {
        console.error("[logoutAllSessions] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
    }

    if (shouldRedirect) {
        redirect("/login");
    }
}

/**
 * Logs a security or user activity event to the database.
 * @param eventType - The machine-readable type of the event.
 * @param description - A human-readable description of the action.
 * @param metadata - Optional additional JSON data related to the event.
 */
export async function logActivity(eventType: string, description: string, metadata: Record<string, unknown> = {}) {
    try {
        const supabase = await createClient(true); // System access to log
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase.from("activity_logs").insert({
            user_id: user.id,
            event_type: eventType,
            description,
            metadata: metadata as any, // Cast to any to satisfy Supabase JSON typing while keeping external type safety
        });

        if (error) {
            console.error(`[logActivity] Failed to insert log for user ${user.id} (${eventType}):`, error.message, {
                description,
                metadata
            });
        }
    } catch (err) {
        console.error("[logActivity] Unexpected Error:", err);
    }
}

/**
 * Internal helper to update user account details.
 * @param userId - The ID of the user to update.
 * @param accountType - The type of account ("individual" | "organisation").
 * @param supabase - The Supabase client to use.
 * @returns An object indicating success or an error message.
 */
async function updateUserAccount(userId: string, accountType: string, supabase: SupabaseClient) {
    try {
        const { error } = await supabase
            .from("users")
            .update({
                userType: accountType,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq("id", userId);

        if (error) {
            console.error("[updateUserAccount] User Update Error:", error);
            return { success: false, error: "Unable to save account details" };
        }
        return { success: true };
    } catch (err) {
        console.error("[updateUserAccount] Unexpected Error:", err);
        return { success: false, error: "Unexpected error saving account details" };
    }
}

/**
 * Internal helper to upsert user notification preferences.
 * @param userId - The ID of the user to update.
 * @param notificationPreference - The preference type ("standard" | "privacy").
 * @param supabase - The Supabase client to use.
 * @returns An object indicating success or an error message.
 */
async function upsertUserPreferences(userId: string, notificationPreference: string, supabase: SupabaseClient) {
    try {
        const isStandard = notificationPreference === "standard";
        const { error } = await supabase
            .from("user_preferences")
            .upsert({
                user_id: userId,
                email_notifications: true,
                push_notifications: isStandard,
                marketing_emails: isStandard,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("[upsertUserPreferences] Preference Error:", error);
            return { success: false, error: "Unable to save notification preferences" };
        }
        return { success: true };
    } catch (err) {
        console.error("[upsertUserPreferences] Unexpected Error:", err);
        return { success: false, error: "Unable to save notification preferences" };
    }
}

/**
 * Persists data collected during the Profile Completion Wizard.
 * Updates both the user profile and notification preferences.
 * @param data - The data collected from the wizard steps.
 * @returns An object indicating success or an error message.
 */
export async function completeProfileWizard(data: {
    notificationPreference: "standard" | "privacy";
    accountType: "individual" | "organisation";
}) {
    // 0. Validate and normalize inputs
    const accountType = data.accountType?.trim().toLowerCase();
    const notificationPreference = data.notificationPreference?.trim().toLowerCase();

    if (!["individual", "organisation"].includes(accountType)) {
        console.error("[completeProfileWizard] Validation Error: Invalid accountType", { accountType });
        return { success: false, error: "Invalid account type provided" };
    }

    if (!["standard", "privacy"].includes(notificationPreference)) {
        console.error("[completeProfileWizard] Validation Error: Invalid notificationPreference", { notificationPreference });
        return { success: false, error: "Invalid notification preference provided" };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Unauthorized" };

        // 1. Update account type on the users table
        const userResult = await updateUserAccount(user.id, accountType, supabase);
        if (!userResult.success) return userResult;

        // 2. Update notification preferences
        const prefResult = await upsertUserPreferences(user.id, notificationPreference, supabase);
        if (!prefResult.success) return prefResult;

        await logActivity("wizard_completed", "Completed the profile completion wizard.", {
            accountType,
            preference: notificationPreference
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        console.error("[completeProfileWizard] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred while saving your profile" };
    }
}

/**
 * Retrieves the preferences for a specific user, creating defaults if they don't exist.
 * @param userId - The ID of the user to fetch preferences for.
 * @returns The user's preferences object or null if retrieval fails.
 */
export async function getUserPreferences(userId: string): Promise<UserPreference | null> {
    const trimmedId = userId?.trim();
    if (!trimmedId) {
        return null;
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", trimmedId)
            .single();

        if (error) {
            // Only attempt to insert defaults if the error is "not found" (PGRST116)
            if (error.code === 'PGRST116') {
                const { data: newData, error: createError } = await supabase
                    .from("user_preferences")
                    .insert({ user_id: trimmedId })
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
    } catch (err) {
        console.error("[getUserPreferences] Unexpected Error:", err);
        return null;
    }
}
