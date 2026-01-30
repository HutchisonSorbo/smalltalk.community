-- Migration: Add VCSS Status to Tenants
-- Description: Adds vcss_status column for Victorian Child Safe Standards status
-- Date: 2026-02-15

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS vcss_status JSONB DEFAULT '[]';

COMMENT ON COLUMN tenants.vcss_status IS 'Array of VCSSStandard objects tracking compliance with Victorian Child Safe Standards';
