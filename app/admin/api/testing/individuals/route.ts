import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users, musicianProfiles, volunteerProfiles, professionalProfiles } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// Extended input validation schema
const createIndividualsSchema = z.object({
    count: z.number().min(1).max(10),
    ageGroup: z.enum(["teen", "adult", "senior"]),
    accountType: z.enum(["Individual", "Business", "Government Organisation", "Charity", "Other"]).default("Individual"),
    onboardingState: z.enum(["not_started", "in_progress", "completed"]).default("completed"),
    isAdmin: z.boolean().default(false),
    isMinor: z.boolean().default(false),
    profiles: z.object({
        musician: z.boolean().default(false),
        volunteer: z.boolean().default(false),
        professional: z.boolean().default(false)
    }).optional()
});

// Australian first names for realistic test data
const FIRST_NAMES = [
    "Oliver", "Charlotte", "Noah", "Amelia", "Jack", "Isla", "William", "Olivia",
    "Henry", "Mia", "Thomas", "Ava", "James", "Grace", "Lucas", "Sophie",
    "Ethan", "Chloe", "Alexander", "Emily", "Michael", "Ella", "Daniel", "Ruby"
];

// Australian last names
const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Wilson", "Taylor",
    "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia",
    "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall"
];

// Mitchell & Murrindindi Shire locations
const LOCATIONS = [
    "Kilmore, VIC 3764",
    "Broadford, VIC 3658",
    "Seymour, VIC 3660",
    "Yea, VIC 3717",
    "Alexandra, VIC 3714",
    "Marysville, VIC 3779",
    "Wallan, VIC 3756",
    "Kinglake, VIC 3763",
    "Eildon, VIC 3713",
    "Healesville, VIC 3777"
];

// Instruments for musician profiles
const INSTRUMENTS = ["Guitar", "Bass", "Drums", "Keyboard/Piano", "Vocals", "Saxophone"];
const GENRES = ["Rock", "Pop", "Jazz", "Blues", "Folk", "Indie"];
const PROFESSIONAL_ROLES = ["Producer", "Audio Engineer", "Photographer", "Teacher", "Manager"];

// Generate random date of birth based on age group
function generateDob(ageGroup: string): Date {
    const now = new Date();
    let minAge: number, maxAge: number;

    switch (ageGroup) {
        case "teen":
            minAge = 13;
            maxAge = 17;
            break;
        case "senior":
            minAge = 65;
            maxAge = 80;
            break;
        default: // adult
            minAge = 18;
            maxAge = 64;
    }

    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const dob = new Date(now.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return dob;
}

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomChoices<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

function getOnboardingSettings(state: string): { completed: boolean; step: number } {
    switch (state) {
        case "not_started":
            return { completed: false, step: 0 };
        case "in_progress":
            return { completed: false, step: 3 };
        case "completed":
        default:
            return { completed: true, step: 7 };
    }
}

/**
 * POST /admin/api/testing/individuals - Create test individual accounts
 */
export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

        const json = await request.json();
        const parsed = createIndividualsSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const { count, ageGroup, accountType, onboardingState, isAdmin, isMinor, profiles } = parsed.data;
        const onboarding = getOnboardingSettings(onboardingState);
        const createdEmails: string[] = [];
        let profilesCreated = 0;

        for (let i = 0; i < count; i++) {
            const uuid = uuidv4().slice(0, 8);
            const email = `test-${uuid}@smalltalk.test`;
            const firstName = randomChoice(FIRST_NAMES);
            const lastName = randomChoice(LAST_NAMES);
            const location = randomChoice(LOCATIONS);
            const dob = generateDob(ageGroup);
            const userId = uuidv4();

            try {
                // Create the user
                await db.insert(users).values({
                    id: userId,
                    email,
                    firstName,
                    lastName,
                    dateOfBirth: dob,
                    userType: 'individual',
                    accountType,
                    onboardingCompleted: onboarding.completed,
                    onboardingStep: onboarding.step,
                    isAdmin,
                    isMinor: ageGroup === "teen" ? true : isMinor,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                createdEmails.push(email);

                // Create profiles if requested
                if (profiles?.musician) {
                    try {
                        await db.insert(musicianProfiles).values({
                            id: uuidv4(),
                            userId,
                            name: `${firstName} ${lastName}`,
                            bio: `Test musician profile for ${firstName}`,
                            instruments: randomChoices(INSTRUMENTS, 2),
                            genres: randomChoices(GENRES, 2),
                            experienceLevel: randomChoice(["Beginner", "Intermediate", "Advanced"]),
                            location,
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        profilesCreated++;
                    } catch (err) {
                        console.error(`Failed to create musician profile for ${email}:`, err);
                    }
                }

                if (profiles?.volunteer) {
                    try {
                        // Extract suburb and postcode from location (format: "Suburb, VIC POSTCODE")
                        const locationParts = location.split(", ");
                        const suburb = locationParts[0] || location;
                        const postcode = location.match(/\d{4}/)?.[0] || "";

                        await db.insert(volunteerProfiles).values({
                            userId,
                            headline: `Volunteer - ${firstName} ${lastName}`,
                            bio: `Test volunteer profile for ${firstName}`,
                            locationSuburb: suburb,
                            locationPostcode: postcode,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        profilesCreated++;
                    } catch (err) {
                        console.error(`Failed to create volunteer profile for ${email}:`, err);
                    }
                }

                if (profiles?.professional) {
                    try {
                        await db.insert(professionalProfiles).values({
                            id: uuidv4(),
                            userId,
                            role: randomChoice(PROFESSIONAL_ROLES),
                            bio: `Test professional profile for ${firstName}`,
                            location,
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        profilesCreated++;
                    } catch (err) {
                        console.error(`Failed to create professional profile for ${email}:`, err);
                    }
                }
            } catch (err) {
                console.error(`Failed to create test user ${email}:`, err);
            }
        }

        // Log the action
        console.log(`[Admin Test Create] Admin ${admin.email} created ${createdEmails.length} test individuals with ${profilesCreated} profiles:`, createdEmails);

        return NextResponse.json({
            success: true,
            created: createdEmails,
            count: createdEmails.length,
            profilesCreated
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating test individuals:", error);

        // Handle auth redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to create test individuals" },
            { status: 500 }
        );
    }
}
