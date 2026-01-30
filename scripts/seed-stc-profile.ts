/**
 * Seed script for stc (smalltalk.community Inc) public profile data
 * Run with: npx tsx scripts/seed-stc-profile.ts
 */

import { config } from "dotenv";
config(); // Load .env file

import { createServiceClient } from "../lib/supabase-service";

async function seedStcProfile() {
    console.log("🌱 Seeding stc profile data...\n");

    const supabase = createServiceClient();

    // Upsert stc tenant with public profile data
    const { data, error } = await supabase
        .from("tenants")
        .upsert({
            code: "stc",
            name: "smalltalk.community Inc",
            mission_statement: `smalltalk.community Inc is dedicated to building safer, more connected communities across Australia. We create digital tools and platforms that empower local organisations, support youth engagement, and foster meaningful connections between people of all ages.`,
            hero_image_url: null, // Will use primary color as fallback
            social_links: {
                facebook: "https://facebook.com/smalltalkcommunity",
                instagram: "https://instagram.com/smalltalk.community",
                linkedin: "https://linkedin.com/company/smalltalk-community",
            },
            contact_email: "hello@smalltalk.community",
            contact_phone: null,
            address: "Melbourne, Victoria, Australia",
            is_public: true,
            primary_color: "#4F46E5",
            secondary_color: "#818CF8",
            vcss_status: [], // Ensure explicit empty array if not set
        }, { onConflict: "code" })
        .select()
        .single();

    if (error) {
        console.error("❌ Error seeding stc profile:", error.message);
        process.exit(1);
    }

    if (!data) {
        // Should not happen with upsert + select + single, but good safety
        console.error("❌ Failed to retrieve stc tenant data after upsert.");
        process.exit(1);
    }

    console.log("✅ Successfully seeded stc profile!\n");
    console.log("Updated fields:");
    console.log(`  - Name: ${data.name}`);
    console.log(`  - Code: ${data.code}`);
    console.log(`  - Mission: ${data.mission_statement?.substring(0, 50)}...`);
    console.log(`  - Social Links: ${Object.keys(data.social_links || {}).join(", ")}`);
    console.log(`  - Contact Email: ${data.contact_email}`);
    console.log(`  - Address: ${data.address}`);
    console.log(`  - Is Public: ${data.is_public}`);
    console.log(`  - VCSS Status: ${JSON.stringify(data.vcss_status)}`);
    console.log("\n🎉 Done! Visit /org/stc to see the public profile.");
}

seedStcProfile().catch(console.error);
