"use client";

import * as React from "react";
import { COSKanban, COSKanbanCard } from "@/components/communityos/ui/cos-kanban";
import { CRMContact, CRM_STAGES, CRMPipelineStage } from "@/lib/communityos/crm/types";

interface PipelineBoardProps {
    contacts: CRMContact[];
    onMove: (contactId: string, newStatus: string) => void;
    onContactClick: (contact: CRMContact) => void;
    onAddClick: (status: string) => void;
    className?: string;
    filteredStages?: string[]; // Optional: show only subset of stages
}

export function PipelineBoard({
    contacts,
    onMove,
    onContactClick,
    onAddClick,
    className,
    filteredStages
}: PipelineBoardProps) {

    // 1. Prepare Columns
    const columns = React.useMemo(() => {
        let stages = CRM_STAGES;
        if (filteredStages) {
            stages = stages.filter(s => filteredStages.includes(s.id));
        }
        return stages.map(s => ({
            id: s.id,
            title: s.label
        }));
    }, [filteredStages]);

    // 2. Map Contacts to Kanban Cards
    const cards: COSKanbanCard[] = React.useMemo(() => {
        return contacts.map(contact => ({
            id: contact.id,
            title: `${contact.firstName} ${contact.lastName}`,
            subtitle: contact.company || contact.role, // Fallback to role
            status: contact.status,
            // Simple logic to map value/segments to priority for visual flair if needed
            priority: contact.value && contact.value > 10000 ? 'high' : undefined,
            tags: contact.tags,
            assignee: {
                name: `${contact.firstName} ${contact.lastName}`, // Using contact itself as avatar source for now
                avatar: contact.avatar
            }
        }));
    }, [contacts]);

    // 3. Handlers
    const handleCardClick = (card: COSKanbanCard) => {
        const contact = contacts.find(c => c.id === card.id);
        if (contact) {
            onContactClick(contact);
        }
    };

    return (
        <COSKanban
            columns={columns}
            cards={cards}
            onMove={onMove}
            onCardClick={handleCardClick}
            onAddClick={onAddClick}
            className={className}
        />
    );
}
