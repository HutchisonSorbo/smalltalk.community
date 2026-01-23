"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserPreference } from "@/shared/schema";

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

        // Sanitize payload to only include allowed preference keys
        const allowlist: (keyof UserPreference)[] = ["theme", "language", "highContrast", "reducedMotion"];
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
            if (allowlist.includes(key as keyof UserPreference)) {
                acc[key as keyof UserPreference] = data[key as keyof UserPreference];
            }
            return acc;
        }, {} as Record<string, any>);

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
    try {
        const supabase = await createClient();

        // Log activity BEFORE signing out to ensure current user context is available
        await logActivity("logout_global", "Global logout initiated from security settings.");

        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
            console.error("[logoutAllSessions] SignOut Error:", error);
            return { success: false, error: "Unable to sign out globally" };
        }

        redirect("/login");
    } catch (err) {
        console.error("[logoutAllSessions] Unexpected Error:", err);
        return { success: false, error: "An unexpected error occurred" };
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
 * Persists data collected during the Profile Completion Wizard.
 * Updates both the user profile and notification preferences.
 * @param data - The data collected from the wizard steps.
 * @returns An object indicating success or an error message.
 */
export async function completeProfileWizard(data: {
    notificationPreference: "standard" | "privacy";
    accountType: "individual" | "organisation";
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Unauthorized" };

        // 1. Update account type on the users table
        const { error: userError } = await supabase
            .from("users")
            .update({
                userType: data.accountType,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq("id", user.id);

        if (userError) {
            console.error("[completeProfileWizard] User Update Error:", userError);
            return { success: false, error: "Unable to save account details" };
        }

        // 2. Update notification preferences
        // Map wizard preferences to schema fields
        const isStandard = data.notificationPreference === "standard";
        const { error: prefError } = await supabase
            .from("user_preferences")
            .upsert({
                user_id: user.id,
                email_notifications: true,
                push_notifications: isStandard,
                marketing_emails: isStandard,
                updated_at: new Date().toISOString(),
            });

        if (prefError) {
            console.error("[completeProfileWizard] Preference Error:", prefError);
            return { success: false, error: "Unable to save notification preferences" };
        }

        await logActivity("wizard_completed", "Completed the profile completion wizard.", {
            accountType: data.accountType,
            preference: data.notificationPreference
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
    try {
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
    } catch (err) {
        console.error("[getUserPreferences] Unexpected Error:", err);
        return null;
    }
}
