-- CommunityOS Multi-Tenancy Schema Migration
-- Creates tenants and tenant_members tables with RLS policies
-- Also creates tenant_invites for the invitation system
-- Enable RLS on all tables
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_invites ENABLE ROW LEVEL SECURITY;
-- Tenants table: organisations using CommunityOS
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    -- URL slug, e.g. 'stc' for smalltalk.community Inc
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#4F46E5',
    -- Hex color for theming
    secondary_color VARCHAR(7) DEFAULT '#818CF8',
    description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Tenant members: users who belong to a tenant with role-based access
CREATE TABLE IF NOT EXISTS tenant_members (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    -- 'admin', 'board', 'member'
    invited_by VARCHAR REFERENCES users(id) ON DELETE
    SET NULL,
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, user_id)
);
-- Tenant invites: pending invitations to join a tenant
CREATE TABLE IF NOT EXISTS tenant_invites (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    token VARCHAR(64) NOT NULL UNIQUE,
    invited_by VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS tenant_members_tenant_id_idx ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_members_user_id_idx ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS tenant_invites_token_idx ON tenant_invites(token);
CREATE INDEX IF NOT EXISTS tenant_invites_email_idx ON tenant_invites(email);
CREATE INDEX IF NOT EXISTS tenants_code_idx ON tenants(code);
-- RLS Policies for tenants table
-- Anyone can read tenant info (for public branding)
CREATE POLICY "tenants_public_read" ON tenants FOR
SELECT TO public USING (true);
-- Only service role can modify tenants (admin-only via API)
CREATE POLICY "tenants_service_write" ON tenants FOR ALL TO service_role USING (true) WITH CHECK (true);
-- RLS Policies for tenant_members table
-- Users can read their own memberships
CREATE POLICY "tenant_members_self_read" ON tenant_members FOR
SELECT TO authenticated USING ((auth.uid())::text = user_id);
-- Admins of a tenant can read all members of that tenant
CREATE POLICY "tenant_members_admin_read" ON tenant_members FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM tenant_members tm
            WHERE tm.tenant_id = tenant_members.tenant_id
                AND tm.user_id = (auth.uid())::text
                AND tm.role = 'admin'
        )
    );
-- Service role has full access
CREATE POLICY "tenant_members_service_all" ON tenant_members FOR ALL TO service_role USING (true) WITH CHECK (true);
-- RLS Policies for tenant_invites table
-- Only admins of a tenant can manage invites
CREATE POLICY "tenant_invites_admin_all" ON tenant_invites FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM tenant_members tm
        WHERE tm.tenant_id = tenant_invites.tenant_id
            AND tm.user_id = (auth.uid())::text
            AND tm.role = 'admin'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM tenant_members tm
        WHERE tm.tenant_id = tenant_invites.tenant_id
            AND tm.user_id = (auth.uid())::text
            AND tm.role = 'admin'
    )
);
-- Service role has full access to invites
CREATE POLICY "tenant_invites_service_all" ON tenant_invites FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Seed data: smalltalk.community Inc as the first tenant
INSERT INTO tenants (
        id,
        code,
        name,
        logo_url,
        primary_color,
        description
    )
VALUES (
        'stc-00000000-0000-0000-0000-000000000001',
        'stc',
        'smalltalk.community Inc',
        '/images/stc-logo.png',
        '#4F46E5',
        'A Victorian non-profit organisation supporting community connection and development.'
    ) ON CONFLICT (code) DO NOTHING;