"use server";

import { db } from "@/server/db";
import {
    crmPipelines,
    crmPipelineStages,
    crmContacts,
    crmDeals,
    crmActivityLog,
    organisationMembers,
} from "@/shared/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * Result pattern for server actions
 */
export type ActionResult<T = any> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Basic input validation and sanitisation
 */
function sanitizeInput(text: string | unknown, maxLength = 255): string {
    if (typeof text !== "string") return "";
    return text.trim().slice(0, maxLength);
}

/**
 * Audit log helper for CRM actions
 */
async function logCrmAction(params: {
    organisationId: string;
    userId: string;
    action: string;
    dealId?: string;
    contactId?: string;
    details?: any;
}) {
    try {
        await db.insert(crmActivityLog).values({
            organisationId: params.organisationId,
            userId: params.userId,
            action: params.action,
            dealId: params.dealId,
            contactId: params.contactId,
            details: params.details || {},
        });
    } catch (err) {
        console.error("[logCrmAction] failed:", err);
    }
}

/**
 * Verify if user is an admin or coordinator of an organisation
 */
async function verifyOrgAccess(
    organisationId: string,
    requiredRoles: string[] = ["admin", "coordinator"]
): Promise<ActionResult<{ userId: string }>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const [membership] = await db
            .select()
            .from(organisationMembers)
            .where(
                and(
                    eq(organisationMembers.organisationId, organisationId),
                    eq(organisationMembers.userId, user.id)
                )
            )
            .limit(1);

        if (!membership || !requiredRoles.includes(membership.role || "")) {
            return { success: false, error: "Insufficient permissions" };
        }

        return { success: true, data: { userId: user.id } };
    } catch (err) {
        console.error("[verifyOrgAccess] error:", err);
        return { success: false, error: "Authorisation check failed" };
    }
}

/**
 * Verify if a stage belongs to an organisation
 */
async function verifyStageOrg(organisationId: string, stageId: string): Promise<boolean> {
    try {
        const [result] = await db
            .select({ id: crmPipelineStages.id })
            .from(crmPipelineStages)
            .innerJoin(crmPipelines, eq(crmPipelineStages.pipelineId, crmPipelines.id))
            .where(
                and(
                    eq(crmPipelineStages.id, stageId),
                    eq(crmPipelines.organisationId, organisationId)
                )
            )
            .limit(1);
        return !!result;
    } catch (err) {
        console.error("[verifyStageOrg] error:", err);
        return false;
    }
}

// --- Pipeline Actions ---

export async function getPipelines(organisationId: string): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    try {
        const pipelines = await db
            .select()
            .from(crmPipelines)
            .where(eq(crmPipelines.organisationId, organisationId))
            .orderBy(desc(crmPipelines.createdAt));

        return { success: true, data: pipelines };
    } catch (err) {
        console.error("[getPipelines] error:", err);
        return { success: false, error: "Failed to fetch pipelines" };
    }
}

export async function createPipeline(
    organisationId: string,
    data: { name: string; description?: string }
): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId);
    if (!auth.success) return auth;

    const name = sanitizeInput(data.name);
    if (!name) return { success: false, error: "Pipeline name is required" };

    try {
        const [pipeline] = await db.transaction(async (tx: any) => {
            const [p] = await tx
                .insert(crmPipelines)
                .values({
                    organisationId,
                    name,
                    description: sanitizeInput(data.description, 1000),
                })
                .returning();

            const defaultStages = [
                { name: "Lead", position: 0, color: "#94A3B8" },
                { name: "Qualified", position: 1, color: "#60A5FA" },
                { name: "Proposal", position: 2, color: "#FBBF24" },
                { name: "Negotiation", position: 3, color: "#A78BFA" },
                { name: "Closed Won", position: 4, color: "#34D399" },
                { name: "Closed Lost", position: 5, color: "#F87171" },
            ];

            await tx.insert(crmPipelineStages).values(
                defaultStages.map((s) => ({
                    pipelineId: p.id,
                    ...s,
                }))
            );

            return [p];
        });

        await logCrmAction({
            organisationId,
            userId: auth.data.userId,
            action: "pipeline_created",
            details: { pipelineId: pipeline.id, name: pipeline.name },
        });

        revalidatePath(`/crm/${organisationId}`);
        return { success: true, data: pipeline };
    } catch (err) {
        console.error("[createPipeline] error:", err);
        return { success: false, error: "Failed to create pipeline" };
    }
}

// --- Contact Actions ---

export async function getContacts(organisationId: string): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    try {
        const contacts = await db
            .select()
            .from(crmContacts)
            .where(eq(crmContacts.organisationId, organisationId))
            .orderBy(desc(crmContacts.createdAt));

        return { success: true, data: contacts };
    } catch (err) {
        console.error("[getContacts] error:", err);
        return { success: false, error: "Failed to fetch contacts" };
    }
}

export async function createContact(
    organisationId: string,
    data: any
): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId);
    if (!auth.success) return auth;

    const firstName = sanitizeInput(data.firstName);
    const lastName = sanitizeInput(data.lastName);

    if (!firstName || !lastName) {
        return { success: false, error: "First and last name are required" };
    }

    try {
        const [contact] = await db
            .insert(crmContacts)
            .values({
                organisationId,
                firstName,
                lastName,
                email: sanitizeInput(data.email),
                phone: sanitizeInput(data.phone, 20),
                type: data.type === "organisation" ? "organisation" : "individual",
                metadata: data.metadata || {},
            })
            .returning();

        await logCrmAction({
            organisationId,
            userId: auth.data.userId,
            action: "contact_created",
            contactId: contact.id,
            details: { name: `${contact.firstName} ${contact.lastName}`.trim() },
        });

        revalidatePath(`/crm/${organisationId}/contacts`);
        return { success: true, data: contact };
    } catch (err) {
        console.error("[createContact] error:", err);
        return { success: false, error: "Failed to create contact" };
    }
}

// --- Deal Actions ---

export async function getDeals(organisationId: string, pipelineId: string): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    try {
        const deals = await db
            .select({ deal: crmDeals })
            .from(crmDeals)
            .innerJoin(crmPipelineStages, eq(crmDeals.pipelineStageId, crmPipelineStages.id))
            .where(
                and(
                    eq(crmDeals.organisationId, organisationId),
                    eq(crmPipelineStages.pipelineId, pipelineId)
                )
            )
            .orderBy(desc(crmDeals.createdAt));

        return { success: true, data: deals.map((d: any) => d.deal) };
    } catch (err) {
        console.error("[getDeals] error:", err);
        return { success: false, error: "Failed to fetch deals" };
    }
}

export async function createDeal(
    organisationId: string,
    data: any
): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId);
    if (!auth.success) return auth;

    const title = sanitizeInput(data.title);
    if (!title) return { success: false, error: "Deal title is required" };

    if (!data.pipelineStageId) return { success: false, error: "Pipeline stage is required" };

    // Verify stage belongs to org
    if (!(await verifyStageOrg(organisationId, data.pipelineStageId))) {
        return { success: false, error: "Invalid pipeline stage" };
    }

    try {
        const [deal] = await db
            .insert(crmDeals)
            .values({
                organisationId,
                contactId: data.contactId,
                pipelineStageId: data.pipelineStageId,
                title,
                value: Number.isFinite(Number(data.value)) ? Number(data.value).toString() : "0",
                probability: Math.max(0, Math.min(100, parseInt(data.probability) || 0)),
                expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
                notes: sanitizeInput(data.notes, 2000),
            })
            .returning();

        await logCrmAction({
            organisationId,
            userId: auth.data.userId,
            action: "deal_created",
            dealId: deal.id,
            contactId: deal.contactId || undefined,
            details: { title: deal.title },
        });

        revalidatePath(`/crm/${organisationId}`);
        return { success: true, data: deal };
    } catch (err) {
        console.error("[createDeal] error:", err);
        return { success: false, error: "Failed to create deal" };
    }
}

export async function updateDealStage(
    organisationId: string,
    dealId: string,
    newStageId: string
): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId);
    if (!auth.success) return auth;

    if (!(await verifyStageOrg(organisationId, newStageId))) {
        return { success: false, error: "Invalid pipeline stage" };
    }

    try {
        const [oldDeal] = await db
            .select()
            .from(crmDeals)
            .where(and(eq(crmDeals.id, dealId), eq(crmDeals.organisationId, organisationId)))
            .limit(1);

        if (!oldDeal) {
            return { success: false, error: "Deal not found" };
        }

        const [updatedDeal] = await db
            .update(crmDeals)
            .set({
                pipelineStageId: newStageId,
                updatedAt: new Date(),
            })
            .where(and(eq(crmDeals.id, dealId), eq(crmDeals.organisationId, organisationId)))
            .returning();

        await logCrmAction({
            organisationId,
            userId: auth.data.userId,
            action: "stage_changed",
            dealId,
            details: {
                fromStage: oldDeal.pipelineStageId,
                toStage: newStageId,
            },
        });

        revalidatePath(`/crm/${organisationId}`);
        return { success: true, data: updatedDeal };
    } catch (err) {
        console.error("[updateDealStage] error:", err);
        return { success: false, error: "Failed to update deal stage" };
    }
}

// --- Activity Log Actions ---

export async function getActivityLog(
    organisationId: string,
    filters?: { dealId?: string; contactId?: string; action?: string }
): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    try {
        const conditions = [eq(crmActivityLog.organisationId, organisationId)];

        if (filters?.dealId) {
            conditions.push(eq(crmActivityLog.dealId, filters.dealId));
        }
        if (filters?.contactId) {
            conditions.push(eq(crmActivityLog.contactId, filters.contactId));
        }
        if (filters?.action) {
            conditions.push(eq(crmActivityLog.action, filters.action));
        }

        const logs = await db
            .select()
            .from(crmActivityLog)
            .where(and(...conditions))
            .orderBy(desc(crmActivityLog.createdAt))
            .limit(50);

        return { success: true, data: logs };
    } catch (err) {
        console.error("[getActivityLog] error:", err);
        return { success: false, error: "Failed to fetch activity log" };
    }
}

// --- Search Actions ---

export async function searchCrm(
    organisationId: string,
    searchTerm: string
): Promise<ActionResult<{ contacts: any[]; deals: any[] }>> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    const query = sanitizeInput(searchTerm);
    if (query.length < 2) return { success: true, data: { contacts: [], deals: [] } };

    try {
        const sqlQuery = `%${query}%`;

        const [contacts, deals] = await Promise.all([
            db
                .select()
                .from(crmContacts)
                .where(
                    and(
                        eq(crmContacts.organisationId, organisationId),
                        sql`${crmContacts.firstName} || ' ' || ${crmContacts.lastName} ILIKE ${sqlQuery}`
                    )
                )
                .limit(10),
            db
                .select()
                .from(crmDeals)
                .where(
                    and(
                        eq(crmDeals.organisationId, organisationId),
                        sql`${crmDeals.title} ILIKE ${sqlQuery}`
                    )
                )
                .limit(10),
        ]);

        return {
            success: true,
            data: { contacts, deals },
        };
    } catch (err) {
        console.error("[searchCrm] error:", err);
        return { success: false, error: "Search failed" };
    }
}

// --- Metadata Actions ---

export async function getPipelineStages(organisationId: string, pipelineId: string): Promise<ActionResult> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator", "viewer"]);
    if (!auth.success) return auth;

    try {
        const [pipeline] = await db
            .select()
            .from(crmPipelines)
            .where(and(eq(crmPipelines.id, pipelineId), eq(crmPipelines.organisationId, organisationId)))
            .limit(1);

        if (!pipeline) return { success: false, error: "Pipeline not found" };

        const stages = await db
            .select()
            .from(crmPipelineStages)
            .where(eq(crmPipelineStages.pipelineId, pipelineId))
            .orderBy(asc(crmPipelineStages.position));

        return { success: true, data: stages };
    } catch (err) {
        console.error("[getPipelineStages] error:", err);
        return { success: false, error: "Failed to fetch stages" };
    }
}

// --- Bulk Actions ---

export async function bulkCreateContacts(
    organisationId: string,
    contacts: { firstName: string; lastName: string; email: string | null; phone: string | null }[]
): Promise<ActionResult<{ createdCount: number }>> {
    const auth = await verifyOrgAccess(organisationId, ["admin", "coordinator"]);
    if (!auth.success) return auth;

    // Enforce record limit
    if (contacts.length > 500) {
        return { success: false, error: "Maximum of 500 contacts per bulk import." };
    }

    try {
        const now = new Date();
        const insertData = contacts.map((c) => ({
            id: crypto.randomUUID(),
            organisationId,
            firstName: sanitizeInput(c.firstName),
            lastName: sanitizeInput(c.lastName),
            email: sanitizeInput(c.email),
            phone: sanitizeInput(c.phone, 20),
            type: "individual" as const,
            createdAt: now,
            updatedAt: now,
        }));

        await db.insert(crmContacts).values(insertData);

        await logCrmAction({
            organisationId,
            userId: auth.data.userId,
            action: "bulk_contacts_created",
            details: {
                count: insertData.length,
                source: "csv_import"
            },
        });

        revalidatePath(`/crm/${organisationId}/contacts`);
        return { success: true, data: { createdCount: insertData.length } };
    } catch (err) {
        console.error("[bulkCreateContacts] error:", err);
        return { success: false, error: "Failed to create contacts" };
    }
}
