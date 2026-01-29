
import { db } from "./server/db";
import { tenants } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Checking for tenant with code 'stc'...");
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.code, "stc"),
  });

  if (tenant) {
    console.log("Tenant found:", tenant);
    console.log("isPublic:", tenant.isPublic);
  } else {
    console.log("Tenant 'stc' not found.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
