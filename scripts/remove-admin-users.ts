"use strict";
import "dotenv/config";
import { db } from "../server/db";
import {
    users,
    musicianProfiles,
    volunteerProfiles,
    professionalProfiles,
    marketplaceListings,
    notifications,
    userApps,
    userPrivacySettings,
    userNotificationPreferences,
    userOnboardingResponses,
    sysUserRoles,
} from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const ADMINS_TO_REMOVE = [
    "smalltalk.test.user+1767151492533@gmail.com",
    "jules.test.admin@smalltalk.community"
];

async function removeAdminUsers() {
    console.log("Starting removal of extra admin users...\n");

    for (const email of ADMINS_TO_REMOVE) {
        console.log(`Processing: ${email}`);

        const [user] = await db
            .select({ id: users.id, email: users.email, isAdmin: users.isAdmin })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            console.log(`  ⚠️ User not found in database\n`);
            continue;
        }

        console.log(`  Found user: ${user.id}`);
        console.log(`  Admin status: ${user.isAdmin}`);

        // Delete related records first (those without CASCADE ON DELETE)
        console.log("  Cleaning up related records...");

        try {
            await db.delete(musicianProfiles).where(eq(musicianProfiles.userId, user.id));
            console.log("    - Deleted musician profiles");
        } catch { /* no profiles */ }

        try {
            await db.delete(volunteerProfiles).where(eq(volunteerProfiles.userId, user.id));
            console.log("    - Deleted volunteer profiles");
        } catch { /* no profiles */ }

        try {
            await db.delete(professionalProfiles).where(eq(professionalProfiles.userId, user.id));
            console.log("    - Deleted professional profiles");
        } catch { /* no profiles */ }

        try {
            await db.delete(marketplaceListings).where(eq(marketplaceListings.userId, user.id));
            console.log("    - Deleted marketplace listings");
        } catch { /* no listings */ }

        try {
            await db.delete(notifications).where(eq(notifications.userId, user.id));
            console.log("    - Deleted notifications");
        } catch { /* no notifications */ }

        try {
            await db.delete(userApps).where(eq(userApps.userId, user.id));
            console.log("    - Deleted user apps");
        } catch { /* no apps */ }

        try {
            await db.delete(userPrivacySettings).where(eq(userPrivacySettings.userId, user.id));
            console.log("    - Deleted privacy settings");
        } catch { /* no settings */ }

        try {
            await db.delete(userNotificationPreferences).where(eq(userNotificationPreferences.userId, user.id));
            console.log("    - Deleted notification preferences");
        } catch { /* no prefs */ }

        try {
            await db.delete(userOnboardingResponses).where(eq(userOnboardingResponses.userId, user.id));
            console.log("    - Deleted onboarding responses");
        } catch { /* no responses */ }

        try {
            await db.delete(sysUserRoles).where(eq(sysUserRoles.userId, user.id));
            console.log("    - Deleted user roles");
        } catch { /* no roles */ }

        // Now delete the user
        await db.delete(users).where(eq(users.email, email));
        console.log(`  ✅ User deleted successfully\n`);
    }

    console.log("Admin user removal complete!");
    process.exit(0);
}

removeAdminUsers().catch((err) => {
    console.error("Error removing admin users:", err);
    process.exit(1);
});
