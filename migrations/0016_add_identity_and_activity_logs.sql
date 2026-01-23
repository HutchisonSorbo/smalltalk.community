-- Create identity_verifications table
CREATE TABLE IF NOT EXISTS identity_verifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    STATUS VARCHAR(20) NOT NULL DEFAULT 'pending',
    document_type VARCHAR(50),
    id_number VARCHAR(100),
    verification_method VARCHAR(50),
    rejection_reason TEXT,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- Identity RLS Policies
CREATE POLICY "identities_self_read" ON identity_verifications FOR
SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "identities_service_all" ON identity_verifications FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Activity Log RLS Policies
CREATE POLICY "activity_logs_self_read" ON activity_logs FOR
SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "activity_logs_service_all" ON activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Indexes
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_event_type_idx ON activity_logs(event_type);