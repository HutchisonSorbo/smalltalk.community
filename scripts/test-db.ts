
import "dotenv/config";
import { storage } from "../server/storage";
import { db } from "../server/db";

async function main() {
    try {
        const userId = "78c2a206-fd92-4fdd-b17b-b1f8237f82e5"; // Ryan's user ID from previous log
        console.log("Testing getMusicianProfilesByUser...");
        const profiles = await storage.getMusicianProfilesByUser(userId);
        console.log("Profiles:", profiles);

        console.log("Testing getNotifications...");
        const notifications = await storage.getNotifications(userId);
        console.log("Notifications:", notifications);

        console.log("Testing getUnreadNotificationCount...");
        const count = await storage.getUnreadNotificationCount(userId);
        console.log("Unread count:", count);

        console.log("Testing getUser...");
        const user = await storage.getUser(userId);
        console.log("User:", user);

        console.log("Testing getBandsByUser...");
        const bands = await storage.getBandsByUser(userId);
        console.log("Bands:", bands);

        console.log("Testing getUnreadMessageCount...");
        const messageCount = await storage.getUnreadMessageCount(userId);
        console.log("Message count:", messageCount);

        console.log("Success!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

main();
