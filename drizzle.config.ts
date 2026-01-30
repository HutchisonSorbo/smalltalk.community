import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: [
    "users",
    "volunteer*",
    "organis*",
    "skills",
    "sys_*",
    "bands*",
    "gigs*",
    "marketplace*",
    "messages",
    "musician*",
    "notifications",
    "professional*",
    "profile_skills",
    "credentials",
    "contact*",
    "reviews",
    "reports",
    "classifieds",
    "announcements",
    "rate_limits",
    "sessions",
    "user_*",
    "apps",
    "onboarding*",
    "tenants",
    "tenant_*",
    "admin_*",
    "crm_*"
  ],
});
