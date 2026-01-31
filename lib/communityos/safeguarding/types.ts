import { z } from "zod";

export const VCSSStandardStatusSchema = z.enum(["not-started", "in-progress", "compliant", "non-compliant"]);
export type VCSSStandardStatus = z.infer<typeof VCSSStandardStatusSchema>;

export const EvidenceCategorySchema = z.enum(["policy", "training", "audit", "other"]);
export type EvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

export const IncidentSeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum(["reported", "investigating", "resolved", "escalated"]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const RiskAssessmentStatusSchema = z.enum(["draft", "active", "archived"]);
export type RiskAssessmentStatus = z.infer<typeof RiskAssessmentStatusSchema>;

export interface Evidence {
    id: string;
    organisation_id: string;
    uploaded_by: string;
    vcss_standard_id: number;
    filename: string;
    storage_path: string;
    category: EvidenceCategory;
    uploaded_at: string;
    metadata?: Record<string, unknown>;
}

export interface SafeguardingIncident {
    id: string;
    organisation_id: string;
    reporter_id: string;
    date: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    actions: IncidentAction[];
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
}

export interface IncidentAction {
    id: string;
    incident_id: string;
    organisation_id: string;
    user_id: string;
    action: string;
    created_at: string;
}

export interface RiskAssessment {
    id: string;
    organisation_id: string;
    assessor_id: string;
    activity_name: string;
    description?: string;
    likelihood: number; // 1-5
    impact: number; // 1-5
    inherent_risk_score: number;
    controls?: string;
    residual_likelihood?: number; // 1-5
    residual_impact?: number; // 1-5
    residual_risk_score?: number;
    review_date?: string;
    status: RiskAssessmentStatus;
    created_at: string;
    updated_at: string;
}

export type RiskAssessmentInput = Omit<RiskAssessment, "id" | "organisation_id" | "assessor_id" | "status" | "created_at" | "updated_at" | "inherent_risk_score" | "residual_risk_score">;

export const RiskAssessmentSchema = z.object({
    activity_name: z.string().min(1, "Activity name is required").max(100),
    description: z.string().max(1000).optional(),
    likelihood: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    controls: z.string().max(500).optional(),
    residual_likelihood: z.number().int().min(1).max(5).optional(),
    residual_impact: z.number().int().min(1).max(5).optional(),
    status: RiskAssessmentStatusSchema.optional().default("draft"),
});

export interface VCSSRequirement {
    id: string;
    text: string;
    completed: boolean;
}

export interface VCSSStandard {
    id: number;
    title: string;
    description: string;
    requirements: VCSSRequirement[];
    status: VCSSStandardStatus;
    lastReviewed?: string;
    nextReview?: string;
}
