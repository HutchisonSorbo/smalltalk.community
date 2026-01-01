import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Disable prepared statements for Supabase Transaction Pooler compatibility
// Use global singleton for all environments to prevent connection exhaustion
export const queryClient = global.queryClient || postgres(process.env.DATABASE_URL, { prepare: false });
global.queryClient = queryClient;

// Cleanup connection on process exit (Production only)
if (process.env.NODE_ENV === "production") {
  process.once('SIGTERM', () => {
    queryClient.end().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('Error closing database connection:', err);
      process.exit(1);
    });
  });
}

/**
 * Single shared Drizzle DB instance for running queries/migrations.
 * Usage: Import `db` to execute queries, e.g., `await db.select().from(table)`.
 * @constant {ReturnType<typeof drizzle>}
 */
export const db = drizzle(queryClient, { schema });

// Add global type definition for queryClient
declare global {
  var queryClient: postgres.Sql | undefined;
}
