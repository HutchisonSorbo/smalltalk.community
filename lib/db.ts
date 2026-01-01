import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
}

const client = global.queryClient || postgres(process.env.DATABASE_URL, { prepare: false });

if (process.env.NODE_ENV !== "production") {
    global.queryClient = client;
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
