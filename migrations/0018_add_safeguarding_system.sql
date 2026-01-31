-- Safeguarding Incidents
CREATE TABLE IF NOT EXISTS safeguarding_incidents (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    reporter_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE
    SET NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        description TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (
            severity IN ('low', 'medium', 'high', 'critical')
        ),
        status VARCHAR(20) NOT NULL DEFAULT 'reported' CHECK (
            status IN (
                'reported',
                'investigating',
                'resolved',
                'escalated'
            )
        ),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Safeguarding Incident Actions
CREATE TABLE IF NOT EXISTS safeguarding_incident_actions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id VARCHAR NOT NULL REFERENCES safeguarding_incidents(id) ON DELETE CASCADE,
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Safeguarding Evidence
CREATE TABLE IF NOT EXISTS safeguarding_evidence (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    uploaded_by VARCHAR NOT NULL REFERENCES users(id) ON DELETE
    SET NULL,
        vcss_standard_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        storage_path TEXT NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (
            category IN ('policy', 'training', 'audit', 'other')
        ),
        metadata JSONB DEFAULT '{}'::jsonb,
        uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Safeguarding Risk Assessments
CREATE TABLE IF NOT EXISTS safeguarding_risk_assessments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id VARCHAR NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    assessor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE
    SET NULL,
        activity_name VARCHAR(255) NOT NULL,
        description TEXT,
        likelihood INTEGER NOT NULL CHECK (
            likelihood BETWEEN 1 AND 5
        ),
        impact INTEGER NOT NULL CHECK (
            impact BETWEEN 1 AND 5
        ),
        inherent_risk_score INTEGER NOT NULL,
        controls TEXT,
        residual_likelihood INTEGER CHECK (
            residual_likelihood BETWEEN 1 AND 5
        ),
        residual_impact INTEGER CHECK (
            residual_impact BETWEEN 1 AND 5
        ),
        residual_risk_score INTEGER,
        review_date TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE safeguarding_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_incident_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_risk_assessments ENABLE ROW LEVEL SECURITY;
-- safeguarding_incidents RLS Policies
CREATE POLICY "safeguarding_incidents_org_read" ON safeguarding_incidents FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "safeguarding_incidents_admin_all" ON safeguarding_incidents FOR ALL TO authenticated USING (
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
-- safeguarding_incident_actions RLS Policies
CREATE POLICY "safeguarding_incident_actions_org_read" ON safeguarding_incident_actions FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "safeguarding_incident_actions_admin_all" ON safeguarding_incident_actions FOR ALL TO authenticated USING (
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
-- safeguarding_evidence RLS Policies
CREATE POLICY "safeguarding_evidence_org_read" ON safeguarding_evidence FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "safeguarding_evidence_admin_all" ON safeguarding_evidence FOR ALL TO authenticated USING (
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
-- safeguarding_risk_assessments RLS Policies
CREATE POLICY "safeguarding_risk_assessments_org_read" ON safeguarding_risk_assessments FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM organisation_members om
            WHERE om.organisation_id = organisation_id
                AND om.user_id = auth.uid()::text
        )
    );
CREATE POLICY "safeguarding_risk_assessments_admin_all" ON safeguarding_risk_assessments FOR ALL TO authenticated USING (
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
-- Service Role Policies (All)
CREATE POLICY "safeguarding_incidents_service_all" ON safeguarding_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "safeguarding_incident_actions_service_all" ON safeguarding_incident_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "safeguarding_evidence_service_all" ON safeguarding_evidence FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "safeguarding_risk_assessments_service_all" ON safeguarding_risk_assessments FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Indexes
CREATE INDEX IF NOT EXISTS safeguarding_incidents_organisation_id_idx ON safeguarding_incidents(organisation_id);
CREATE INDEX IF NOT EXISTS safeguarding_incidents_reporter_id_idx ON safeguarding_incidents(reporter_id);
CREATE INDEX IF NOT EXISTS safeguarding_incident_actions_incident_id_idx ON safeguarding_incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS safeguarding_incident_actions_organisation_id_idx ON safeguarding_incident_actions(organisation_id);
CREATE INDEX IF NOT EXISTS safeguarding_evidence_organisation_id_idx ON safeguarding_evidence(organisation_id);
CREATE INDEX IF NOT EXISTS safeguarding_evidence_vcss_standard_id_idx ON safeguarding_evidence(vcss_standard_id);
CREATE INDEX IF NOT EXISTS safeguarding_risk_assessments_organisation_id_idx ON safeguarding_risk_assessments(organisation_id);
CREATE INDEX IF NOT EXISTS safeguarding_risk_assessments_assessor_id_idx ON safeguarding_risk_assessments(assessor_id);