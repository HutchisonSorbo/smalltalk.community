import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import dns from "node:dns";

// Force IPv4 for DNS resolution in development to avoid IPv6 connection issues
// Supabase pooler supports IPv4, but some local environments have IPv6 problems
if (process.env.NODE_ENV !== "production") {
  dns.setDefaultResultOrder("ipv4first");
}

declare global {
  var queryClient: postgres.Sql | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Optimized connection settings for Vercel Serverless + Supabase Transaction Mode Pooler
 * 
 * Key optimizations per Supabase/Vercel best practices:
 * - prepare: false - Required for transaction mode pooler (does not support prepared statements)
 * - max: 3 - Allow a few concurrent connections for parallel queries (pooler handles actual pooling)
 * - idle_timeout: 0 - Let Supabase pooler manage connection lifecycle, don't close prematurely
 * - connect_timeout: 30 - Generous timeout for cold starts
 * - max_lifetime: 60 - Force connection refresh every 60s to prevent stale connections
 * - connection.statement_timeout - Prevent queries from running indefinitely
 * 
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres#serverless-apis
 */
const dbOptions: postgres.Options<{}> = {
  prepare: false,           // Required for Supabase transaction mode pooler
  max: 3,                   // Allow parallel queries, pooler handles actual connection reuse
  idle_timeout: 0,          // Let Supabase pooler manage idle connections
  connect_timeout: 30,      // 30s timeout for cold starts
  max_lifetime: 60,         // Force reconnect every 60s to prevent stale connections
  connection: {
    statement_timeout: 30000, // 30 second statement timeout to prevent runaway queries
  },
};

// Use global singleton to prevent connection exhaustion during hot reloads
export const queryClient = global.queryClient || postgres(process.env.DATABASE_URL, dbOptions);

if (process.env.NODE_ENV !== "production") {
  global.queryClient = queryClient;
}

/**
 * Single shared Drizzle DB instance for running queries/migrations.
 * Usage: Import `db` to execute queries, e.g., `await db.select().from(table)`
 * @constant {ReturnType<typeof drizzle>}
 */
export const db = drizzle(queryClient, { schema });
