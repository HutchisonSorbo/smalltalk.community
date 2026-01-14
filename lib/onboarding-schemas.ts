import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { users, userOnboardingResponses, userPrivacySettings, userNotificationPreferences } from "@shared/schema";

// --- Registration Schema ---
// Used for step 1 account creation
export const registerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .regex(/^\S*$/, "Password must not contain spaces"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    userType: z.enum(["individual", "organisation"]).default("individual"),
    accountType: z.enum(["Individual", "Business", "Government Organisation", "Charity", "Other"]).default("Individual"),
    accountTypeSpecification: z.string().optional(),
    organisationName: z.string().optional(),
    dateOfBirth: z.string().or(z.date()).optional().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date < new Date();
    }, "Invalid date of birth"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.userType === "organisation" && (!data.organisationName || data.organisationName.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Organisation name is required for organisation accounts",
    path: ["organisationName"],
});

export type RegisterInput = z.infer<typeof registerSchema>;


// --- Profile Schema ---
// Used for step 2 profile details
export const profileSetupSchema = z.object({
    bio: z.string().max(500).optional(),
    headline: z.string().max(100).optional(),
    location: z.string().optional(), // We might convert to lat/long on server
    profileImageUrl: z.string().url().optional(),

    // For Organizations
    serviceArea: z.string().optional(),

    // Generic interests (stored in userOnboardingResponses or used to tag user? 
    // Schema says relevantInterests in apps, but user interests might be in existing tables or userOnboardingResponses)
    interests: z.array(z.string()).optional(),

    // Accessibility
    accessibilityNeeds: z.array(z.string()).optional(),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;


// --- Intent Schema ---
// Used for step 3
export const intentSchema = z.object({
    primaryIntent: z.string().min(1, "Please select a primary intent"),
    specificGoals: z.array(z.string()).optional(),
});

export type IntentInput = z.infer<typeof intentSchema>;


// --- Privacy & Notifications Schema ---
// Used for step 4
// We can combine privacy and notifications update in one schema for the frontend form
export const privacyDetailsSchema = z.object({
    privacySettings: (createInsertSchema(userPrivacySettings) as any).omit({
        id: true, userId: true, createdAt: true, settingsUpdatedAt: true
    }).partial(),

    notificationPreferences: (createInsertSchema(userNotificationPreferences) as any).omit({
        id: true, userId: true, createdAt: true, preferencesUpdatedAt: true
    }).partial(),
});

export type PrivacyDetailsInput = z.infer<typeof privacyDetailsSchema>;


// --- App Selection Schema ---
export const appSelectionSchema = z.object({
    selectedAppIds: z.array(z.string().uuid()),
});

export type AppSelectionInput = z.infer<typeof appSelectionSchema>;
