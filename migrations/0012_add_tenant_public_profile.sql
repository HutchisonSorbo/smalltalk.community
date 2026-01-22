-- Migration: Add Public Profile Fields to Tenants
-- Description: Adds fields for public organisation profile pages at /org/[tenantCode]
-- Date: 2026-01-22
-- Add new columns for public profile display
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS mission_statement TEXT,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
-- Add comment for documentation
COMMENT ON COLUMN tenants.hero_image_url IS 'Banner/hero image URL for public profile page';
COMMENT ON COLUMN tenants.mission_statement IS 'Organisation mission statement displayed on public profile';
COMMENT ON COLUMN tenants.social_links IS 'JSON object with social media links (facebook, instagram, twitter, linkedin, youtube)';
COMMENT ON COLUMN tenants.contact_email IS 'Public contact email for the organisation';
COMMENT ON COLUMN tenants.contact_phone IS 'Public contact phone number';
COMMENT ON COLUMN tenants.address IS 'Physical address of the organisation';
COMMENT ON COLUMN tenants.is_public IS 'Whether the organisation profile is publicly visible';