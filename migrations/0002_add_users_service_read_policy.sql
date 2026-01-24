-- Add service_role read policy to users table
-- This allows server-side admin checks and middleware to read user records
-- without relying on the user's JWT context
-- Create the policy (use IF NOT EXISTS pattern with DO block)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'users'
        AND policyname = 'users_service_read'
) THEN CREATE POLICY "users_service_read" ON "users" FOR
SELECT TO service_role USING (true);
END IF;
END $$;