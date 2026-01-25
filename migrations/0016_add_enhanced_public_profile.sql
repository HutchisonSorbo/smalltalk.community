-- Migration: Add Enhanced Public Profile Fields to Tenants
-- Description: Adds JSONB columns for impact stats, programs, team, gallery, testimonials, CTAs, and events
-- Date: 2026-01-25
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS impact_stats JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS programs JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS cta_buttons JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS upcoming_events JSONB DEFAULT '[]';
COMMENT ON COLUMN tenants.impact_stats IS 'Array of {label, value, icon} for organisation impact metrics';
COMMENT ON COLUMN tenants.programs IS 'Array of {title, description, imageUrl, linkUrl} for organisation programs';
COMMENT ON COLUMN tenants.team_members IS 'Array of {name, title, bio, imageUrl, linkedinUrl} for core team/leadership';
COMMENT ON COLUMN tenants.gallery_images IS 'Array of {url, caption} for photo gallery';
COMMENT ON COLUMN tenants.testimonials IS 'Array of {quote, author, role, imageUrl} for testimonials/quotes';
COMMENT ON COLUMN tenants.cta_buttons IS 'Array of {label, url, style} for public profile call-to-action buttons';
COMMENT ON COLUMN tenants.upcoming_events IS 'Array of {title, date, location, url} for manual upcoming events display';