-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en-AU',
    timezone VARCHAR(50) DEFAULT 'Australia/Melbourne',
    high_contrast BOOLEAN DEFAULT false,
    reduced_motion BOOLEAN DEFAULT false,
    font_size VARCHAR(10) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "preferences_self_read" ON user_preferences FOR
SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "preferences_self_update" ON user_preferences FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "preferences_self_insert" ON user_preferences FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
-- Service role has full access
CREATE POLICY "preferences_service_all" ON user_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Index for performance
CREATE INDEX IF NOT EXISTS preferences_user_id_idx ON user_preferences(user_id);
-- Trigger to create preferences for existing users (idempotent)
INSERT INTO user_preferences (user_id)
SELECT id
FROM users ON CONFLICT (user_id) DO NOTHING;