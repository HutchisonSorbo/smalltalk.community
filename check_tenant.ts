import { db } from "./server/db";
import { tenants } from "./shared/schema";
import { eq } from "drizzle-orm";

/**
 * Checks for the existence of the tenant with code 'stc' and logs non-sensitive details.
 * Strictly adheres to privacy standards by avoiding the logging of PII.
 */
async function checkStcTenant() {
  try {
    console.log("Checking for tenant with code 'stc'...");
    
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.code, "stc"),
    });

    if (tenant) {
      // Log only non-sensitive fields to prevent PII exposure (e.g., contactEmail, address)
      console.log("Tenant found:", {
        id: tenant.id,
        code: tenant.code,
        name: tenant.name,
        isPublic: tenant.isPublic,
      });
    } else {
      console.log("Tenant 'stc' not found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("An error occurred while checking the 'stc' tenant:", error instanceof Error ? error.message : "Unknown error");
    
    // Ensure the process exits with a failure code on error
    process.exit(1);
  }
}

// Initialise the check
checkStcTenant();