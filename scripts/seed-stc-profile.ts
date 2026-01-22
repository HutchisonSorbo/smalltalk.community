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

    // Update stc tenant with public profile data
    const { data, error } = await supabase
        .from("tenants")
        .update({
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
        })
        .eq("code", "stc")
        .select()
        .single();

    if (error) {
        console.error("❌ Error updating stc profile:", error.message);
        process.exit(1);
    }

    if (!data) {
        console.error("❌ stc tenant not found. Make sure tenant exists with code 'stc'");
        process.exit(1);
    }

    console.log("✅ Successfully updated stc profile!\n");
    console.log("Updated fields:");
    console.log(`  - Mission: ${data.mission_statement?.substring(0, 50)}...`);
    console.log(`  - Social Links: ${Object.keys(data.social_links || {}).join(", ")}`);
    console.log(`  - Contact Email: ${data.contact_email}`);
    console.log(`  - Address: ${data.address}`);
    console.log(`  - Is Public: ${data.is_public}`);
    console.log("\n🎉 Done! Visit /org/stc to see the public profile.");
}

seedStcProfile().catch(console.error);
