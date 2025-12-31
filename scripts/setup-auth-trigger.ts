
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function setupAuthTrigger() {
  console.log("Setting up auth trigger...");

  try {
    // 1. Create the function
    await sql`
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.users (
          id,
          email,
          first_name,
          last_name,
          user_type,
          account_type,
          organisation_name,
          date_of_birth,
          created_at,
          updated_at
        )
        values (
          new.id,
          new.email,
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'last_name',
          coalesce(new.raw_user_meta_data ->> 'user_type', 'musician'),
          coalesce(new.raw_user_meta_data ->> 'account_type', 'Individual'),
          new.raw_user_meta_data ->> 'organisation_name',
          (new.raw_user_meta_data ->> 'date_of_birth')::timestamp,
          new.created_at,
          new.updated_at
        );
        return new;
      end;
      $$;
    `;
    console.log("Function handle_new_user created/updated.");

    // 2. Create the trigger
    // Drop first to allow re-running
    await sql`drop trigger if exists on_auth_user_created on auth.users`;

    await sql`
      create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    `;
    console.log("Trigger on_auth_user_created created.");

  } catch (error) {
    console.error("Error setting up auth trigger:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupAuthTrigger();
