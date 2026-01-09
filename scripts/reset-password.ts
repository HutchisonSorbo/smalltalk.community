import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as readline from "readline";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

// Create Supabase client with session persistence disabled for CLI scripts
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

// Basic email validation
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength validation (minimum 8 chars, at least one letter and one number)
function isValidPassword(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[a-zA-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

// Securely read input from stdin (masks password input on TTY)
function readLineSecure(prompt: string, mask = false): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        if (mask && process.stdin.isTTY) {
            // For password, we need to handle character-by-character for masking
            process.stdout.write(prompt);
            let password = "";

            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding("utf8");

            const onData = (char: string) => {
                // Handle Ctrl+C
                if (char === "\u0003") {
                    process.stdout.write("\n");
                    process.exit(1);
                }
                // Handle Enter
                if (char === "\r" || char === "\n") {
                    process.stdin.setRawMode(false);
                    process.stdin.removeListener("data", onData);
                    process.stdout.write("\n");
                    rl.close();
                    resolve(password);
                    return;
                }
                // Handle Backspace
                if (char === "\u007f" || char === "\b") {
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write("\b \b");
                    }
                    return;
                }
                // Regular character
                password += char;
                process.stdout.write("*");
            };

            process.stdin.on("data", onData);
        } else {
            rl.question(prompt, (answer) => {
                rl.close();
                resolve(answer);
            });
        }
    });
}

async function main() {
    // Get email from args or prompt
    let email = process.argv[2];
    if (!email) {
        email = await readLineSecure("Enter user email: ");
    }

    if (!email || !isValidEmail(email)) {
        console.error("Error: Invalid email format");
        process.exit(1);
    }

    // Always prompt for password securely (never accept from CLI args for security)
    console.log("Note: Password must be at least 8 characters with at least one letter and one number.");
    const password = await readLineSecure("Enter new password: ", true);

    if (!isValidPassword(password)) {
        console.error("Error: Password does not meet requirements (min 8 chars, at least one letter and one number)");
        process.exit(1);
    }

    // Confirm password
    const confirmPassword = await readLineSecure("Confirm password: ", true);
    if (password !== confirmPassword) {
        console.error("Error: Passwords do not match");
        process.exit(1);
    }

    console.log(`\nResetting password for ${email}...`);

    // 1. Find user ID from email in public.users
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error("User not found in public.users table.");
        process.exit(1);
    }

    // 2. Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: password,
        email_confirm: true // Ensure email is confirmed too
    });

    if (error) {
        console.error("Error resetting password:", error.message);
        process.exit(1);
    }

    console.log(`✅ Successfully reset password for ${email}.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Error resetting password:", err);
    process.exit(1);
});
