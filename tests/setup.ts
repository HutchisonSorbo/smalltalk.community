/**
 * Vitest Setup File
 * 
 * This file runs before all tests to configure the test environment.
 * It sets up mock environment variables to prevent database connection errors
 * when testing modules that indirectly import database dependencies.
 */

// Set mock DATABASE_URL for unit tests that import modules with database dependencies
// This prevents the "DATABASE_URL must be set" error during test module imports
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}
