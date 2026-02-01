
export type CRMStatus = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost' | 'active' | 'inactive' | 'customer' | 'churned';

export interface CRMContact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organisationId: string; // Tenant scoping
    status: CRMStatus;
    segments: string[];
    source?: string;
    tags?: string[];
    role?: string;
    company?: string;
    avatar?: string;
    lastContacted?: string; // ISO Date
    nextFollowUp?: string; // ISO Date
    value?: number; // Potential deal value
    customFields?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    interactions?: CRMInteraction[];
}

export type InteractionType = 'note' | 'email' | 'call' | 'meeting' | 'task';

export interface CRMInteraction {
    id: string;
    contactId: string;
    type: InteractionType;
    content: string;
    date: string; // ISO Date
    duration?: number; // In minutes
    outcome?: string;
    createdBy: string; // User ID
    createdAt: string;
    attachments?: string[];
}

export interface CRMPipelineStage {
    id: CRMStatus;
    label: string;
    color: string;
    order: number;
}

export const CRM_STAGES: CRMPipelineStage[] = [
    { id: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800', order: 1 },
    { id: 'qualified', label: 'Qualified', color: 'bg-indigo-100 text-indigo-800', order: 2 },
    { id: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800', order: 3 },
    { id: 'won', label: 'Won', color: 'bg-green-100 text-green-800', order: 4 },
    { id: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800', order: 5 },
    { id: 'active', label: 'Active', color: 'bg-gray-100 text-gray-800', order: 6 },
    { id: 'inactive', label: 'Inactive', color: 'bg-gray-50 text-gray-600', order: 7 },
    { id: 'customer', label: 'Customer', color: 'bg-emerald-100 text-emerald-800', order: 8 },
    { id: 'churned', label: 'Churned', color: 'bg-orange-100 text-orange-800', order: 9 },
];
