
import "dotenv/config";
import { queryClient } from "../server/db";

async function main() {
    try {
        console.log("Enabling RLS on all tables...");

        const commands = [
            // Enable RLS
            `ALTER TABLE users ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE musician_profiles ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE bands ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE reviews ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE band_members ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE gigs ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE reports ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY`,
            `ALTER TABLE sessions ENABLE ROW LEVEL SECURITY`,

            // 1. Users
            `DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users`,
            `CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true)`,
            `DROP POLICY IF EXISTS "Users can update own profile" ON users`,
            `CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id)`,

            // 2. Musician Profiles
            `DROP POLICY IF EXISTS "Musician profiles are viewable by everyone" ON musician_profiles`,
            `CREATE POLICY "Musician profiles are viewable by everyone" ON musician_profiles FOR SELECT USING (true)`,
            `DROP POLICY IF EXISTS "Users can insert own musician profile" ON musician_profiles`,
            `CREATE POLICY "Users can insert own musician profile" ON musician_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id)`,
            `DROP POLICY IF EXISTS "Users can update own musician profile" ON musician_profiles`,
            `CREATE POLICY "Users can update own musician profile" ON musician_profiles FOR UPDATE USING (auth.uid()::text = user_id)`,

            // 3. Bands
            `DROP POLICY IF EXISTS "Bands are viewable by everyone" ON bands`,
            `CREATE POLICY "Bands are viewable by everyone" ON bands FOR SELECT USING (true)`,
            `DROP POLICY IF EXISTS "Users can create bands" ON bands`,
            `CREATE POLICY "Users can create bands" ON bands FOR INSERT WITH CHECK (auth.uid()::text = user_id)`,
            `DROP POLICY IF EXISTS "Band admins can update band" ON bands`,
            `CREATE POLICY "Band admins can update band" ON bands FOR UPDATE USING (
        auth.uid()::text = user_id OR 
        EXISTS (SELECT 1 FROM band_members WHERE band_id = id AND user_id = auth.uid()::text AND role = 'admin')
      )`,

            // 4. Marketplace Listings
            `DROP POLICY IF EXISTS "Listings are viewable by everyone" ON marketplace_listings`,
            `CREATE POLICY "Listings are viewable by everyone" ON marketplace_listings FOR SELECT USING (true)`,
            `DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings`,
            `CREATE POLICY "Users can create listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid()::text = user_id)`,
            `DROP POLICY IF EXISTS "Users can update own listings" ON marketplace_listings`,
            `CREATE POLICY "Users can update own listings" ON marketplace_listings FOR UPDATE USING (auth.uid()::text = user_id)`,

            // 5. Messages
            `DROP POLICY IF EXISTS "Users can see their own messages" ON messages`,
            `CREATE POLICY "Users can see their own messages" ON messages FOR SELECT USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id)`,
            `DROP POLICY IF EXISTS "Users can insert messages" ON messages`,
            `CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id)`,

            // 6. Notifications
            `DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications`,
            `CREATE POLICY "Users can see their own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id)`,
            `DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications`,
            `CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id)`,
            `DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications`,
            // Note: We might need a policy for creating notifications if it's done by triggers or server actions. 
            // Assuming server connects as superuser provided via connection string, RLS is bypassed. 
            // If client *triggers* a notification creation (unlikely directly?), it would fail.

            // 7. Contact Requests
            `DROP POLICY IF EXISTS "Users can see requests sent or received" ON contact_requests`,
            `CREATE POLICY "Users can see requests sent or received" ON contact_requests FOR SELECT USING (auth.uid()::text = requester_id OR auth.uid()::text = recipient_id)`,
            `DROP POLICY IF EXISTS "Users can create requests" ON contact_requests`,
            `CREATE POLICY "Users can create requests" ON contact_requests FOR INSERT WITH CHECK (auth.uid()::text = requester_id)`,
            `DROP POLICY IF EXISTS "Users can respond to requests" ON contact_requests`,
            `CREATE POLICY "Users can respond to requests" ON contact_requests FOR UPDATE USING (auth.uid()::text = recipient_id)`,

            // 8. Band Members
            `DROP POLICY IF EXISTS "Band members are viewable by everyone" ON band_members`,
            `CREATE POLICY "Band members are viewable by everyone" ON band_members FOR SELECT USING (true)`,

            // 9. Gigs
            `DROP POLICY IF EXISTS "Gigs are viewable by everyone" ON gigs`,
            `CREATE POLICY "Gigs are viewable by everyone" ON gigs FOR SELECT USING (true)`,

            // 10. Reviews
            `DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews`,
            `CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true)`
        ];

        for (const cmd of commands) {
            console.log(`Running: ${cmd}`);
            await queryClient.unsafe(cmd);
        }

        console.log("Successfully enabled RLS and applied policies!");
        process.exit(0);
    } catch (error) {
        console.error("Error enabling RLS:", error);
        process.exit(1);
    }
}

main();
