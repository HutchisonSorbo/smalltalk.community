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
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";

// Test data prefixes to identify test content
const TEST_PREFIX = "[TEST]";
const TEST_ORG_PATTERN = "Test Organisation";

async function getAdminId(): Promise<string | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch {
        return null;
    }
}

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/\[test\]\s*/gi, "test-")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
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

export async function createTestGig(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        // Get or create a test musician to be the organizer
        let [testMusician] = await db
            .select()
            .from(musicianProfiles)
            .where(eq(musicianProfiles.name, `${TEST_PREFIX} Test Artist`))
            .limit(1);

        if (!testMusician) {
            // Need a user first
            const [testUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, "test-musician@smalltalk.test"))
                .limit(1);

            let userId = testUser?.id;
            if (!userId) {
                const [newUser] = await db.insert(users).values({
                    email: "test-musician@smalltalk.test",
                    firstName: "Test",
                    lastName: "Musician",
                    accountType: "Individual",
                }).returning();
                userId = newUser.id;
            }

            const [newMusician] = await db.insert(musicianProfiles).values({
                userId,
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
            action: AdminActions.APP_CREATE,
            targetType: TargetTypes.GIG,
            targetId: newGig.id,
            details: { type: "test_gig", venue },
        });

        return { success: true, message: `Created test gig: ${newGig.title}`, id: newGig.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test gig:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create test gig" };
    }
}

export async function createTestMusician(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        const uniqueId = Date.now();
        const email = `test-musician-${uniqueId}@smalltalk.test`;
        const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan"];
        const firstName = names[Math.floor(Math.random() * names.length)];

        // Create user
        const [newUser] = await db.insert(users).values({
            email,
            firstName,
            lastName: `${TEST_PREFIX.replace(/[\[\]]/g, "")} Artist`,
            accountType: "Individual",
        }).returning();

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
            action: AdminActions.USER_CREATE,
            targetType: TargetTypes.MUSICIAN,
            targetId: newMusician.id,
            details: { type: "test_musician", name: newMusician.name },
        });

        return { success: true, message: `Created test musician: ${newMusician.name}`, id: newMusician.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test musician:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create test musician" };
    }
}

export async function createTestBand(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        const bandNames = ["The Test Subjects", "Demo Band", "Sample Sound", "Trial Tones", "Mock Melody"];
        const uniqueId = Date.now();
        const bandName = `${TEST_PREFIX} ${bandNames[Math.floor(Math.random() * bandNames.length)]} ${uniqueId % 1000}`;

        // Need a user for the band
        let [testUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, "test-band-owner@smalltalk.test"))
            .limit(1);

        if (!testUser) {
            const [newUser] = await db.insert(users).values({
                email: "test-band-owner@smalltalk.test",
                firstName: "Test",
                lastName: "BandOwner",
                accountType: "Individual",
            }).returning();
            testUser = newUser;
        }

        const [newBand] = await db.insert(bands).values({
            userId: testUser.id,
            name: bandName,
            bio: "This is a test band created for admin testing purposes.",
            genres: [TEST_GENRES[Math.floor(Math.random() * TEST_GENRES.length)]],
            location: "Melbourne, VIC",
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.APP_CREATE,
            targetType: TargetTypes.BAND,
            targetId: newBand.id,
            details: { type: "test_band", name: newBand.name },
        });

        return { success: true, message: `Created test band: ${newBand.name}`, id: newBand.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test band:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create test band" };
    }
}

export async function createTestVolunteerOpportunity(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        // First get or create a test organisation
        let [testOrg] = await db
            .select()
            .from(organisations)
            .where(eq(organisations.name, `${TEST_PREFIX} ${TEST_ORG_PATTERN}`))
            .limit(1);

        if (!testOrg) {
            const [orgResult] = await db.insert(organisations).values({
                name: `${TEST_PREFIX} ${TEST_ORG_PATTERN}`,
                slug: generateSlug(`${TEST_PREFIX} ${TEST_ORG_PATTERN}`),
                description: "A test organisation for admin testing purposes.",
            }).returning();
            testOrg = orgResult;
        }

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
            status: "published",
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.APP_CREATE,
            targetType: TargetTypes.ORGANISATION,
            targetId: newRole.id,
            details: { type: "test_volunteer_role", title: newRole.title },
        });

        return { success: true, message: `Created volunteer opportunity: ${newRole.title}`, id: newRole.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test volunteer opportunity:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create volunteer opportunity" };
    }
}

export async function createTestOrganisation(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        const orgTypes = ["Community Centre", "Youth Services", "Environmental Group", "Arts Collective", "Sports Club"];
        const uniqueId = Date.now();
        const orgName = `${TEST_PREFIX} ${orgTypes[Math.floor(Math.random() * orgTypes.length)]} #${uniqueId % 1000}`;

        const [newOrg] = await db.insert(organisations).values({
            name: orgName,
            slug: generateSlug(orgName),
            description: "This is a test organisation created for admin testing purposes. It can be safely deleted.",
        }).returning();

        await logAdminAction({
            adminId,
            action: AdminActions.APP_CREATE,
            targetType: TargetTypes.ORGANISATION,
            targetId: newOrg.id,
            details: { type: "test_organisation", name: newOrg.name },
        });

        return { success: true, message: `Created test organisation: ${newOrg.name}`, id: newOrg.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test organisation:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create test organisation" };
    }
}

export async function createTestVolunteer(): Promise<{ success: boolean; message: string; id?: string }> {
    const adminId = await getAdminId();
    if (!adminId) return { success: false, message: "Not authenticated" };

    try {
        const uniqueId = Date.now();
        const email = `test-volunteer-${uniqueId}@smalltalk.test`;
        const names = ["Casey", "Riley", "Avery", "Jamie", "Quinn"];
        const firstName = names[Math.floor(Math.random() * names.length)];

        // Create user
        const [newUser] = await db.insert(users).values({
            email,
            firstName,
            lastName: `${TEST_PREFIX.replace(/[\[\]]/g, "")} Volunteer`,
            accountType: "Individual",
        }).returning();

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
            action: AdminActions.USER_CREATE,
            targetType: TargetTypes.VOLUNTEER,
            targetId: newVolunteer.id,
            details: { type: "test_volunteer", name: `${firstName} ${TEST_PREFIX} Volunteer` },
        });

        return { success: true, message: `Created test volunteer: ${firstName}`, id: newVolunteer.id };
    } catch (error) {
        console.error("[Test Apps] Error creating test volunteer:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create test volunteer" };
    }
}
