"use client";

import * as React from "react";
import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { updateDealStage } from "@/lib/communityos/crm-actions";
import { toast } from "sonner";
import type { CrmDeal, CrmPipelineStage } from "@/types/crm";

interface UsePipelineDragProps {
    organisationId: string;
    initialDeals: CrmDeal[];
    stages: CrmPipelineStage[];
}

export function usePipelineDrag({ organisationId, initialDeals, stages }: UsePipelineDragProps) {
    const [deals, setDeals] = React.useState<CrmDeal[]>(initialDeals);
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [snapshot, setSnapshot] = React.useState<CrmDeal[] | null>(null);

    React.useEffect(() => {
        setDeals(initialDeals);
    }, [initialDeals]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setSnapshot([...deals]); // Create snapshot for rollback
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeDeal = deals.find((d) => d.id === activeId);
        if (!activeDeal) return;

        // If dragging over a column (stage)
        const isOverColumn = stages.some((s) => s.id === overId);

        if (isOverColumn && activeDeal.pipelineStageId !== overId) {
            setDeals((prev) =>
                prev.map((d) => d.id === activeId ? { ...d, pipelineStageId: overId } : d)
            );
            return;
        }

        // If dragging over another deal
        const overDeal = deals.find((d) => d.id === overId);
        if (overDeal && activeDeal.pipelineStageId !== overDeal.pipelineStageId) {
            setDeals((prev) =>
                prev.map((d) => d.id === activeId ? { ...d, pipelineStageId: overDeal.pipelineStageId } : d)
            );
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            if (snapshot) setDeals(snapshot);
            return;
        }

        const activeIdStr = active.id as string;
        const overId = over.id as string;

        const activeDeal = deals.find((d) => d.id === activeIdStr);
        if (!activeDeal) {
            if (snapshot) setDeals(snapshot);
            return;
        }

        let newStageId = activeDeal.pipelineStageId;

        // Check if we dropped on a column/stage ID directly
        if (stages.some(s => s.id === overId)) {
            newStageId = overId;
        } else {
            // Check if we dropped on another deal
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal) {
                newStageId = overDeal.pipelineStageId;
            }
        }

        // Determine if position changed or stage changed
        const originalDeal = snapshot?.find(d => d.id === activeIdStr);
        const stageChanged = originalDeal && newStageId !== originalDeal.pipelineStageId;

        // Optimistically update positions in local state if dropped in same stage but different position
        if (activeIdStr !== overId) {
            setDeals((items) => {
                const oldIndex = items.findIndex((i) => i.id === activeIdStr);
                const newIndex = items.findIndex((i) => i.id === overId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        // Persist change if stage changed
        if (stageChanged) {
            try {
                const result = await updateDealStage(organisationId, activeIdStr, newStageId);
                if (!result.success) {
                    toast.error(result.error);
                    if (snapshot) setDeals(snapshot);
                } else {
                    toast.success("Deal stage updated");
                }
            } catch (err) {
                toast.error("Failed to update deal stage");
                if (snapshot) setDeals(snapshot);
            }
        }

        setSnapshot(null);
    };

    return {
        deals,
        activeId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    };
}
