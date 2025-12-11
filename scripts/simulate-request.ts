
import "dotenv/config";
import { db } from "../server/db";
import { users, musicianProfiles, contactRequests, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        const targetUserId = "78c2a206-fd92-4fdd-b17b-b1f8237f82e5"; // Ryan's User ID

        console.log(`Creating test user for target: ${targetUserId}...`);

        // 1. Create Test User
        const [testUser] = await db.insert(users).values({
            email: "test.user@example.com",
            firstName: "Test",
            lastName: "User",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
        }).returning();

        console.log("Created test user:", testUser.id);

        // 2. Create Musician Profile for Test User
        const [testProfile] = await db.insert(musicianProfiles).values({
            userId: testUser.id,
            name: "Test Musician",
            bio: "I am a test user created to verify the request system.",
            instruments: ["Bass"],
            genres: ["Funk"],
            experienceLevel: "Beginner",
            availability: "Weekends",
            location: "Melbourne",
            isContactInfoPublic: false,
        }).returning();

        console.log("Created test musician profile:", testProfile.id);

        // 3. Create Contact Request
        console.log("Creating contact request...");
        const [request] = await db.insert(contactRequests).values({
            requesterId: testUser.id,
            recipientId: targetUserId,
            status: "pending",
        }).returning();

        console.log("Created contact request:", request.id);

        // 4. Create Notification
        console.log("Creating notification...");
        await db.insert(notifications).values({
            userId: targetUserId,
            type: "contact_request",
            title: "New Contact Request",
            message: `${testProfile.name} has requested to view your contact details.`,
            isRead: false,
            metadata: {
                requestId: request.id,
                requesterId: testUser.id,
                requesterName: testProfile.name
            },
            link: `/musicians/${testProfile.id}`,
        });

        console.log("Notification sent!");
        console.log("Done.");
        process.exit(0);

    } catch (error) {
        console.error("Error simulating request:", error);
        process.exit(1);
    }
}

main();
