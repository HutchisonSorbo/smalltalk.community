-- Migration: Add Public Profile Fields to Tenants
-- Description: Adds fields for public organisation profile pages at /org/[tenantCode]
-- Date: 2026-01-22
-- Add new columns for public profile display
-- Note: is_public defaults to FALSE for secure-by-default new tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS mission_statement TEXT,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
-- Set existing tenants to public (preserves current behavior for deployed tenants)
-- Remove this line if you want existing tenants to default to private
UPDATE tenants
SET is_public = true
WHERE is_public IS NULL;
-- Add comment for documentation
COMMENT ON COLUMN tenants.hero_image_url IS 'Banner/hero image URL for public profile page';
COMMENT ON COLUMN tenants.mission_statement IS 'Organisation mission statement displayed on public profile';
COMMENT ON COLUMN tenants.social_links IS 'JSON object with social media links (facebook, instagram, twitter, linkedin, youtube)';
COMMENT ON COLUMN tenants.contact_email IS 'Public contact email for the organisation';
COMMENT ON COLUMN tenants.contact_phone IS 'Public contact phone number';
COMMENT ON COLUMN tenants.address IS 'Physical address of the organisation';
COMMENT ON COLUMN tenants.is_public IS 'Whether the organisation profile is publicly visible (default: false for new tenants)';
-- Add composite index for efficient public profile lookups
CREATE INDEX IF NOT EXISTS tenants_code_is_public_idx ON tenants (code, is_public);