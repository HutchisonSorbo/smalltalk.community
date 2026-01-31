/**
 * Shared CRM type definitions
 * Provides type-safe interfaces for CRM components across the application
 */

/**
 * Contact metadata structure
 */
export interface ContactMetadata {
    source?: string;
    tags?: string[];
    notes?: string;
    segments?: string[];
    customFields?: Record<string, string | number | boolean>;
}

/**
 * CRM Contact data structure
 */
export interface CrmContactCardData {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    type: string | null;
    metadata: ContactMetadata | null;
    createdAt: Date | null;
}

/**
 * Props for CRM contact card components
 */
export interface CrmContactCardProps {
    contact: CrmContactCardData;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
    onToggleSelection?: (id: string, selected: boolean) => void;
}

/**
 * Bulk action types for CRM operations
 */
export type CRMBulkAction = "email" | "tag" | "archive" | "delete" | "export";

/**
 * Props for bulk actions component
 */
export interface CRMBulkActionsProps {
    selectedCount: number;
    onClear: () => void;
    onAction: (action: CRMBulkAction) => void;
}

/**
 * Search result types
 */
export interface CrmSearchContact {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface CrmSearchDeal {
    id: string;
    title: string;
    value: number | null;
}

export interface CrmSearchResults {
    contacts: CrmSearchContact[];
    deals: CrmSearchDeal[];
}

/**
 * Pipeline stage structure
 */
export interface CrmPipelineStage {
    id: string;
    pipelineId: string;
    name: string;
    position: number;
    color: string | null;
}

/**
 * Deal structure
 */
export interface CrmDeal {
    id: string;
    title: string;
    value: number | null;
    probability: number | null;
    expectedCloseDate: Date | null;
    pipelineStageId: string;
    contactId: string | null;
    organisationId: string;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Pipeline structure
 */
export interface CrmPipeline {
    id: string;
    organisationId: string;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Activity log structure
 */
export interface CrmActivityLog {
    id: string;
    organisationId: string;
    userId: string;
    action: string;
    dealId: string | null;
    contactId: string | null;
    details: Record<string, unknown> | null;
    createdAt: Date | null;
}
