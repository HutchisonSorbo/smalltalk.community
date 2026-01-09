"use server";

import { db } from "@/server/db";
import {
    gigs,
    musicianProfiles,
    bands,
    volunteerProfiles,
    organisations,
    volunteerRoles,
    users,
} from "@shared/schema";
import { createClient } from "@/lib/supabase-server";
import { eq } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";

// Test data prefixes to identify test content
const TEST_PREFIX = "[TEST]";
const TEST_PREFIX_PLAIN = "TEST";
const TEST_ORG_PATTERN = "Test Organisation";

/**
 * Validates that the request is from an authorized admin AND test mode is enabled.
 * SECURITY: Defense-in-depth authorization check for test actions.
 */
async function authorizeTestAction(): Promise<string | null> {
    // 1. Check environment flag to avoid production pollution
    if (process.env.ADMIN_TEST_APPS_ENABLED !== "true") {
        console.warn("[Test Apps] Attempted to run test action but ADMIN_TEST_APPS_ENABLED is not 'true'");
        return null;
    }

    // 2. Comprehensive admin authorization check (authed, isAdmin, notSuspended)
    const { authorized, adminId } = await verifyAdminRequest();
    if (!authorized) return null;

    return adminId;
}

/**
 * Reusable helper to get an existing test user or create a new one.
 * 
 * Side-effects: Inserts a new user record if the email is not found.
 * Formatting: Automatically prefixes lastName with TEST_PREFIX (e.g. "TEST Artist").
 * 
 * @param email - The unique email address for the test user.
 * @param firstName - The first name of the test user.
 * @param lastName - The base last name (before prefixing).
 * @returns A Promise resolving to the existing or newly created User record.
 */
async function getOrCreateTestUser(email: string, firstName: string, lastName: string) {
    const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existing) return existing;

    const [created] = await db.insert(users).values({
        email,
        firstName,
        lastName: `${TEST_PREFIX_PLAIN} ${lastName}`,
        accountType: "Individual",
    }).returning();

    return created;
}

/**
 * Reusable helper to get an existing test organisation or create a new one.
 */
async function getOrCreateTestOrganisation(name: string) {
    const [existing] = await db
        .select()
        .from(organisations)
        .where(eq(organisations.name, name))
        .limit(1);

    if (existing) return existing;

    const [created] = await db.insert(organisations).values({
        name,
        slug: generateSlug(name),
        description: "A test organisation for admin testing purposes.",
    }).returning();

    return created;
}

/**
 * Helper to generate slug from name.
 * NOTE: This is a simplified implementation for test data. 
 * Collapses consecutive hyphens and appends a timestamp.
 * In production, consider using a dedicated slug library (e.g., slugify).
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/\[test\]\s*/gi, "test-")
        .replace(/[^a-z0-9]+/g, "-") // Convert non-alphanumeric to hyphens
        .replace(/-+/g, "-")         // Collapse consecutive hyphens
        .replace(/(^-|-$)/g, "")     // Trim leading/trailing hyphens
        + "-" + Date.now();
}

// Test Gig venues and names
const TEST_VENUES = [
    "The Test Lounge",
    "Demo Music Hall",
    "Sample Stage",
    "Mock Concert Venue",
    "Trial Theater",
];

const TEST_GENRES = ["Rock", "Jazz", "Blues", "Pop", "Folk"];

/**
 * Creates a test gig event associated with a test musician.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestGig(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        // Get or create a test musician to be the organizer (and their user)
        let [testMusician] = await db
            .select()
            .from(musicianProfiles)
            .where(eq(musicianProfiles.name, `${TEST_PREFIX} Test Artist`))
            .limit(1);

        if (!testMusician) {
            const user = await getOrCreateTestUser("test-musician@smalltalk.test", "Test", "Musician");
            const [newMusician] = await db.insert(musicianProfiles).values({
                userId: user.id,
                name: `${TEST_PREFIX} Test Artist`,
                genres: [TEST_GENRES[Math.floor(Math.random() * TEST_GENRES.length)]],
                instruments: ["Guitar"],
            }).returning();
            testMusician = newMusician;
        }

        // Create the test gig
        const venue = TEST_VENUES[Math.floor(Math.random() * TEST_VENUES.length)];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 7);

        const [newGig] = await db.insert(gigs).values({
            title: `${TEST_PREFIX} Live at ${venue}`,
            description: "This is a test gig created for admin testing purposes. It can be safely deleted.",
            location: `${venue}, 123 Test Street, Melbourne VIC 3000`,
            date: futureDate,
            genre: TEST_GENRES[Math.floor(Math.random() * TEST_GENRES.length)],
            creatorId: testMusician.userId,
            musicianId: testMusician.id,
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.GIG,
            targetId: newGig.id,
            details: { type: "test_gig", venue },
        });

        return { success: true, message: `Created test gig: ${newGig.title}`, id: newGig.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test gig:", error);
        return { success: false, message: "Failed to create test gig" };
    }
}

/**
 * Creates a new test musician profile and associated user.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestMusician(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        const uniqueId = Date.now();
        const email = `test-musician-${uniqueId}@smalltalk.test`;
        const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan"];
        const firstName = names[Math.floor(Math.random() * names.length)];

        // Create user
        const newUser = await getOrCreateTestUser(email, firstName, "Artist");

        // Create musician profile
        const [newMusician] = await db.insert(musicianProfiles).values({
            userId: newUser.id,
            name: `${TEST_PREFIX} ${firstName} the Artist`,
            bio: "This is a test musician profile created for admin testing purposes.",
            genres: [TEST_GENRES[Math.floor(Math.random() * TEST_GENRES.length)]],
            instruments: [["Guitar", "Piano", "Drums", "Bass"][Math.floor(Math.random() * 4)]],
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.MUSICIAN,
            targetId: newMusician.id,
            details: { type: "test_musician", name: newMusician.name },
        });

        return { success: true, message: `Created test musician: ${newMusician.name}`, id: newMusician.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test musician:", error);
        return { success: false, message: "Failed to create test musician" };
    }
}

/**
 * Creates a test band and associated owner user.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestBand(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        const bandNames = ["The Test Subjects", "Demo Band", "Sample Sound", "Trial Tones", "Mock Melody"];
        const uniqueId = Date.now();
        const bandName = `${TEST_PREFIX} ${bandNames[Math.floor(Math.random() * bandNames.length)]} ${uniqueId % 1000}`;

        // Need a user for the band
        const testUser = await getOrCreateTestUser("test-band-owner@smalltalk.test", "Test", "BandOwner");

        const [newBand] = await db.insert(bands).values({
            userId: testUser.id,
            name: bandName,
            bio: "This is a test band created for admin testing purposes.",
            genres: [TEST_GENRES[Math.floor(Math.random() * TEST_GENRES.length)]],
            location: "Melbourne, VIC",
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.BAND,
            targetId: newBand.id,
            details: { type: "test_band", name: newBand.name },
        });

        return { success: true, message: `Created test band: ${newBand.name}`, id: newBand.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test band:", error);
        return { success: false, message: "Failed to create test band" };
    }
}

/**
 * Creates a test volunteer opportunity (role) and associated organisation.
 * Sets the role status to "draft" by default.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestVolunteerOpportunity(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        // First get or create a test organisation
        const testOrg = await getOrCreateTestOrganisation(`${TEST_PREFIX} ${TEST_ORG_PATTERN}`);

        const roleTypes = [
            "Event Helper",
            "Community Outreach",
            "Admin Support",
            "Youth Mentor",
            "Environmental Care",
        ];
        const uniqueId = Date.now();

        const [newRole] = await db.insert(volunteerRoles).values({
            organisationId: testOrg.id,
            title: `${TEST_PREFIX} ${roleTypes[Math.floor(Math.random() * roleTypes.length)]} #${uniqueId % 1000}`,
            description: "This is a test volunteer opportunity created for admin testing purposes.",
            roleType: "ongoing",
            locationType: "on_site",
            address: "123 Test Street, Melbourne VIC 3000",
            status: "draft", // Hide test content from public view
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.VOLUNTEER, // Correct target type for roles
            targetId: newRole.id,
            details: { type: "test_volunteer_role", title: newRole.title },
        });

        return { success: true, message: `Created volunteer opportunity: ${newRole.title}`, id: newRole.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test volunteer opportunity:", error);
        return { success: false, message: "Failed to create volunteer opportunity" };
    }
}

/**
 * Creates a new test organisation.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestOrganisation(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        const orgTypes = ["Community Centre", "Youth Services", "Environmental Group", "Arts Collective", "Sports Club"];
        const uniqueId = Date.now();
        const orgName = `${TEST_PREFIX} ${orgTypes[Math.floor(Math.random() * orgTypes.length)]} #${uniqueId % 1000}`;

        const newOrg = await getOrCreateTestOrganisation(orgName);

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.ORGANISATION,
            targetId: newOrg.id,
            details: { type: "test_organisation", name: newOrg.name },
        });

        return { success: true, message: `Created test organisation: ${newOrg.name}`, id: newOrg.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test organisation:", error);
        return { success: false, message: "Failed to create test organisation" };
    }
}

/**
 * Creates a new test volunteer profile and associated user.
 * 
 * @returns A Promise resolving to an object indicating success, a message, and the new record id.
 */
export async function createTestVolunteer(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await authorizeTestAction();
    if (!adminId) return { success: false, message: "Not authorized or test mode disabled" };

    try {
        const uniqueId = Date.now();
        const email = `test-volunteer-${uniqueId}@smalltalk.test`;
        const names = ["Casey", "Riley", "Avery", "Jamie", "Quinn"];
        const firstName = names[Math.floor(Math.random() * names.length)];

        // Create user
        const newUser = await getOrCreateTestUser(email, firstName, "Volunteer");

        // Create volunteer profile - using correct schema fields
        const [newVolunteer] = await db.insert(volunteerProfiles).values({
            userId: newUser.id,
            headline: `${TEST_PREFIX} Volunteer Profile`,
            bio: "This is a test volunteer profile created for admin testing purposes.",
            locationSuburb: "Melbourne",
            locationPostcode: "3000",
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.TEST_DATA_CREATE,
            targetType: TargetTypes.VOLUNTEER,
            targetId: newVolunteer.id,
            details: { type: "test_volunteer", name: `${firstName} ${TEST_PREFIX_PLAIN} Volunteer` },
        });

        return { success: true, message: `Created test volunteer: ${firstName}`, id: newVolunteer.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test volunteer:", error);
        return { success: false, message: "Failed to create test volunteer" };
    }
}
