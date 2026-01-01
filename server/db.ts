import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";




// Removed global default result order to avoid side effects



declare global {
  var queryClient: postgres.Sql | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Disable prepared statements for Supabase Transaction Pooler compatibility
// Use global singleton for all environments to prevent connection exhaustion

interface PostgresOptions extends postgres.Options<{}> {
  socket?: { family: number };
}

const dbOptions: PostgresOptions = {
  prepare: false,
  socket: { family: 4 } // Force IPv4 for this specific connection
};

export const queryClient = global.queryClient || postgres(process.env.DATABASE_URL, dbOptions);
global.queryClient = queryClient;

// Cleanup connection on process exit (Production only)

// Connection cleanup handling
let isClosing = false;
const handleExit = async (signal: string) => {
  if (isClosing) return;
  isClosing = true;
  console.log(`Received ${signal}, closing database connection...`);
  try {
    await queryClient.end();
    global.queryClient = undefined;
    console.log('Database connection closed');
    if (signal !== 'beforeExit' && signal !== 'module.hot.dispose') {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === "production") {
  process.once('SIGTERM', () => handleExit('SIGTERM'));
} else {
  // Development-safe cleanup
  process.once('SIGINT', () => handleExit('SIGINT'));
  process.once('SIGUSR2', () => handleExit('SIGUSR2')); // Nodemon restart
  process.once('beforeExit', () => handleExit('beforeExit'));

  // @ts-ignore - Hot Module Replacement
  if (typeof module !== 'undefined' && module.hot) {
    // @ts-ignore
    module.hot.dispose(async () => {
      await handleExit('module.hot.dispose');
    });
  }
}

/**
 * Single shared Drizzle DB instance for running queries/migrations.
 * Usage: Import `db` to execute queries, e.g., `await db.select().from(table)`.
 * @constant {ReturnType<typeof drizzle>}
 */
export const db = drizzle(queryClient, { schema });

