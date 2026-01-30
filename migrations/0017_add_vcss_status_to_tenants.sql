-- Migration: Add VCSS Status to Tenants
-- Description: Adds vcss_status column to tenants table which was missing in previous migrations but required by code
-- Date: 2026-01-26

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS vcss_status JSONB DEFAULT '[]';

COMMENT ON COLUMN tenants.vcss_status IS 'Array of VCSSStandard objects for Voluntary Community Sector Standards compliance';
