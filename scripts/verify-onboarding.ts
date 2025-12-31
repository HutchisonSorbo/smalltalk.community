import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BASE_URL = "http://localhost:3000";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

// Use Service Role to bypass Captcha/Auth restrictions for testing
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const timestamp = Date.now();
    const email = `smalltalk.test.user+${timestamp}@gmail.com`;
    const password = "Password123!";

    console.log(`\n--- Starting Verification for ${email} ---\n`);

    // 1. Register
    console.log("1. Registering user...");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            confirmPassword: password,
            firstName: "Test",
            lastName: "User",
            dateOfBirth: "1990-01-01", // Adult
            accountType: "Individual",
            userType: "musician"
        })
    });

    if (!regRes.ok) {
        console.error("Registration failed:", await regRes.text());
        return;
    }
    const regData = await regRes.json();
    console.log("✓ Registration Success:", regData.user.id);
    const userId = regData.user.id;

    // 1b. Confirm Email (Admin)
    console.log("1b. Confirming email...");
    const { error: confirmError } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
    });
    if (confirmError) {
        console.error("Confirmation failed:", confirmError.message);
        return;
    }

    // 2. Login to get Session Token
    console.log("\n2. Logging in to get session...");
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError || !session) {
        console.error("Login failed:", loginError?.message);
        return;
    }
    console.log("✓ Login Success. Token obtained.");
    const token = session.access_token;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Next.js middleware or supabase client relies on this or cookies
    };

    // Note: Our API routes use `supabase.auth.getUser(token)` or similar. 
    // They expect the token in the header usually if using standard Supabase patterns without middleware magic.
    // Let's assume they check Authorization header.

    // 3. Check Status (Should be step 0 or 1)
    console.log("\n3. Checking initial status...");
    const statusRes = await fetch(`${BASE_URL}/api/onboarding/status`, { headers });
    const statusData = await statusRes.json();
    console.log("Status:", statusData);
    if (statusData.onboardingStep !== 0 && statusData.onboardingStep !== 1) {
        console.warn("Warning: Expected step 0 or 1");
    }

    // 4. Submit Profile (Step 1 -> 2)
    console.log("\n4. Submitting Profile...");
    const profileRes = await fetch(`${BASE_URL}/api/onboarding/profile`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            headline: "Guitarist",
            bio: "I play guitar.",
            location: "Melbourne",
            interests: ["Rock", "Jazz"]
        })
    });
    if (!profileRes.ok) console.error("Profile failed:", await profileRes.text());
    else console.log("✓ Profile Saved");

    // 5. Submit Intent (Step 2 -> 3)
    console.log("\n5. Submitting Intent...");
    const intentRes = await fetch(`${BASE_URL}/api/onboarding/intent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            primaryIntent: "find_band",
            specificGoals: ["join_gigging_band"]
        })
    });
    if (!intentRes.ok) console.error("Intent failed:", await intentRes.text());
    else console.log("✓ Intent Saved & Recommendations generated");

    // 6. Get Recommendations
    console.log("\n6. Fetching Recommendations...");
    const recRes = await fetch(`${BASE_URL}/api/onboarding/recommendations`, { headers });
    const recData = await recRes.json();
    console.log(`✓ Got ${recData.recommendations?.length || 0} recommendations`);

    // 7. Select Apps (Step 3 -> 4)
    console.log("\n7. Selecting Apps...");
    const appsRes = await fetch(`${BASE_URL}/api/onboarding/select-apps`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            selectedAppIds: recData.recommendations?.length ? [recData.recommendations[0].app.id] : []
        })
    });
    if (!appsRes.ok) console.error("App Selection failed:", await appsRes.text());
    else console.log("✓ Apps Selected");

    // 8. Privacy (Step 4 -> Complete)
    console.log("\n8. Setting Privacy...");
    const privacyRes = await fetch(`${BASE_URL}/api/onboarding/privacy`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            privacySettings: { profileVisibility: "community_members" },
            notificationPreferences: { emailWeeklyDigest: true }
        })
    });
    if (!privacyRes.ok) console.error("Privacy failed:", await privacyRes.text());
    else console.log("✓ Privacy Saved");

    // 9. Complete
    console.log("\n9. Completing Onboarding...");
    const completeRes = await fetch(`${BASE_URL}/api/onboarding/complete`, {
        method: "POST",
        headers
    });
    if (!completeRes.ok) console.error("Completion failed:", await completeRes.text());
    else console.log("✓ Onboarding Complete");

    // 10. Final Status Check
    console.log("\n10. Final Status Check...");
    const finalStatusRes = await fetch(`${BASE_URL}/api/onboarding/status`, { headers });
    const finalStatusData = await finalStatusRes.json();
    console.log("Final Status:", finalStatusData);

    if (finalStatusData.onboardingCompleted === true) {
        console.log("\n✅ VERIFICATION SUCCESSFUL");
    } else {
        console.error("\n❌ VERIFICATION FAILED: Onboarding not marked as complete");
    }
}

run().catch(console.error);
