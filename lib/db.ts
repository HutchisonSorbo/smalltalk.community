import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
}

// Use global singleton for all environments to prevent connection exhaustion
const client = global.queryClient || postgres(process.env.DATABASE_URL, { prepare: false });
global.queryClient = client;

// Cleanup connection on process exit
if (process.env.NODE_ENV !== "production") {
    // In dev, Next.js handles cleanup on reloads
} else {
    // In production, ensure graceful shutdown if needed
    process.on('SIGTERM', async () => {
        await client.end();
    });
}

/**
 * Single shared Drizzle DB instance for running queries/migrations.
 * Usage: Import `db` to execute queries, e.g., `await db.select().from(table)`.
 * @constant {ReturnType<typeof drizzle>}
 */
export const db = drizzle(client, { schema });

// Add global type definition for queryClient
declare global {
    var queryClient: postgres.Sql | undefined;
}
