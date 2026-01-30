-- CRM Pipelines
CREATE TABLE IF NOT EXISTS crm_pipelines (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- CRM Pipeline Stages
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id VARCHAR NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) DEFAULT '#4F46E5'
);
-- CRM Contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    type VARCHAR(20) NOT NULL DEFAULT 'individual',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- CRM Deals
CREATE TABLE IF NOT EXISTS crm_deals (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    contact_id VARCHAR REFERENCES crm_contacts(id) ON DELETE
    SET NULL,
        pipeline_stage_id VARCHAR NOT NULL REFERENCES crm_pipeline_stages(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        value NUMERIC(12, 2) DEFAULT 0,
        probability INTEGER DEFAULT 0,
        expected_close_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- CRM Activity Log
CREATE TABLE IF NOT EXISTS crm_activity_log (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id VARCHAR REFERENCES crm_deals(id) ON DELETE
    SET NULL,
        contact_id VARCHAR REFERENCES crm_contacts(id) ON DELETE
    SET NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activity_log ENABLE ROW LEVEL SECURITY;
-- CRM Pipeline RLS Policies
CREATE POLICY "crm_pipelines_org_read" ON crm_pipelines FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "crm_pipelines_admin_all" ON crm_pipelines FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
);
-- CRM Pipeline Stages RLS Policies
CREATE POLICY "crm_pipeline_stages_read" ON crm_pipeline_stages FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM crm_pipelines p
            WHERE p.id = pipeline_id
                AND EXISTS (
                    SELECT 1
                    FROM organisation_members om
                    WHERE om.organisation_id = p.organisation_id
                        AND om.user_id = auth.uid()::text
                )
        )
    );
CREATE POLICY "crm_pipeline_stages_admin_all" ON crm_pipeline_stages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM crm_pipelines p
        WHERE p.id = pipeline_id
            AND EXISTS (
                SELECT 1
                FROM organisation_members om
                WHERE om.organisation_id = p.organisation_id
                    AND om.user_id = auth.uid()::text
                    AND om.role IN ('admin', 'coordinator')
            )
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM crm_pipelines p
        WHERE p.id = pipeline_id
            AND EXISTS (
                SELECT 1
                FROM organisation_members om
                WHERE om.organisation_id = p.organisation_id
                    AND om.user_id = auth.uid()::text
                    AND om.role IN ('admin', 'coordinator')
            )
    )
);
-- CRM Contacts RLS Policies
CREATE POLICY "crm_contacts_org_read" ON crm_contacts FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "crm_contacts_admin_all" ON crm_contacts FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
);
-- CRM Deals RLS Policies
CREATE POLICY "crm_deals_org_read" ON crm_deals FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "crm_deals_admin_all" ON crm_deals FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM organisation_members om
        WHERE om.organisation_id = organisation_id
            AND om.user_id = auth.uid()::text
            AND om.role IN ('admin', 'coordinator')
    )
);
-- CRM Activity Log RLS Policies
CREATE POLICY "crm_activity_log_org_read" ON crm_activity_log FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
-- Service Role Policies (All)
CREATE POLICY "crm_pipelines_service_all" ON crm_pipelines FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "crm_pipeline_stages_service_all" ON crm_pipeline_stages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "crm_contacts_service_all" ON crm_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "crm_deals_service_all" ON crm_deals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "crm_activity_log_service_all" ON crm_activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Indexes
CREATE INDEX IF NOT EXISTS crm_pipelines_organisation_id_idx ON crm_pipelines(organisation_id);
CREATE INDEX IF NOT EXISTS crm_pipeline_stages_pipeline_id_idx ON crm_pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS crm_contacts_organisation_id_idx ON crm_contacts(organisation_id);
CREATE INDEX IF NOT EXISTS crm_contacts_email_idx ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS crm_deals_organisation_id_idx ON crm_deals(organisation_id);
CREATE INDEX IF NOT EXISTS crm_deals_pipeline_stage_id_idx ON crm_deals(pipeline_stage_id);
CREATE INDEX IF NOT EXISTS crm_deals_contact_id_idx ON crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS crm_activity_log_organisation_id_idx ON crm_activity_log(organisation_id);
CREATE INDEX IF NOT EXISTS crm_activity_log_deal_id_idx ON crm_activity_log(deal_id);
CREATE INDEX IF NOT EXISTS crm_activity_log_contact_id_idx ON crm_activity_log(contact_id);