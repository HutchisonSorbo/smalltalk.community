
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
      declare
        avatar_url text;
        dob_val text;
        dob_timestamp timestamp;
      begin
        -- Try to find avatar url in common locations
        avatar_url := coalesce(
          new.raw_user_meta_data ->> 'picture',
          new.raw_user_meta_data ->> 'avatar_url',
          new.raw_user_meta_data ->> 'avatar'
        );

        -- Safe date handling
        dob_val := new.raw_user_meta_data ->> 'date_of_birth';
        begin
          if dob_val is not null and dob_val != '' then
            dob_timestamp := dob_val::timestamp;
          else
            dob_timestamp := null;
          end if;
        exception when others then
          dob_timestamp := null;
        end;

        insert into public.users (
          id,
          email,
          first_name,
          last_name,
          profile_image_url,
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
          avatar_url,
          coalesce(new.raw_user_meta_data ->> 'user_type', 'individual'),
          coalesce(new.raw_user_meta_data ->> 'account_type', 'Individual'),
          new.raw_user_meta_data ->> 'organisation_name',
          dob_timestamp,
          new.created_at,
          new.updated_at
        )
        on conflict (id) do nothing; -- Prevent errors on duplicate/retry

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
