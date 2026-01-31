"use client";

import * as React from "react";
import {
    DndContext,
    closestCorners,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { COSCard } from "../ui/cos-card";
import { MoreHorizontal, Plus, Users, DollarSign } from "lucide-react";
import { usePipelineDrag } from "@/hooks/use-pipeline-drag";
import type { CrmDeal, CrmPipelineStage } from "@/types/crm";

interface Props {
    organisationId: string;
    stages: CrmPipelineStage[];
    initialDeals: CrmDeal[];
    onDealClick?: (deal: CrmDeal) => void;
    onAddDeal?: (stageId: string) => void;
}

export function CRMPipelineBoard({
    organisationId,
    stages,
    initialDeals,
    onDealClick,
    onAddDeal
}: Props) {
    const {
        deals,
        activeId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    } = usePipelineDrag({ organisationId, initialDeals, stages });

    const dealsByStage = React.useMemo(() => {
        const grouped: Record<string, CrmDeal[]> = {};
        stages.forEach(s => grouped[s.id] = []);
        deals.forEach(d => {
            if (grouped[d.pipelineStageId]) {
                grouped[d.pipelineStageId].push(d);
            }
        });
        return grouped;
    }, [deals, stages]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-row gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] min-h-[500px] max-w-full" role="list" aria-label="CRM Pipeline Board">
                {stages.map((stage) => (
                    <StageColumn
                        key={stage.id}
                        stage={stage}
                        deals={dealsByStage[stage.id] || []}
                        onDealClick={onDealClick}
                        onAddDeal={onAddDeal}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: "0.5",
                        },
                    },
                }),
            }}>
                {activeId ? (() => {
                    const activeDeal = deals.find((d) => d.id === activeId);
                    return activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null;
                })() : null}
            </DragOverlay>
        </DndContext>
    );
}

function StageColumn({ stage, deals, onDealClick, onAddDeal }: {
    stage: CrmPipelineStage;
    deals: CrmDeal[];
    onDealClick?: (deal: CrmDeal) => void;
    onAddDeal?: (stageId: string) => void;
}) {
    return (
        <div className="flex-shrink-0 w-80 flex flex-col gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 max-h-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color || "grey" }}
                    />
                    <h3 className="font-bold text-sm uppercase tracking-wider truncate" title={stage.name}>{stage.name}</h3>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground shrink-0">
                        {deals.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onAddDeal?.(stage.id)}
                    className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                    aria-label={`Add deal to ${stage.name}`}
                >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>

            <SortableContext
                id={stage.id}
                items={deals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px] pr-1">
                    {deals.map((deal) => (
                        <SortableDealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                    ))}
                    {deals.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted/30">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                No Deals
                            </p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function SortableDealCard({ deal, onClick }: { deal: CrmDeal; onClick?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <DealCard deal={deal} onClick={onClick} />
        </div>
    );
}

function DealCard({ deal, onClick, isOverlay }: { deal: CrmDeal; onClick?: () => void; isOverlay?: boolean }) {
    return (
        <COSCard
            variant="glass"
            interactive
            onClick={onClick}
            className={cn(
                "p-4 border-l-4 border-l-primary shadow-sm",
                isOverlay && "cursor-grabbing shadow-xl rotate-2 scale-105"
            )}
        >
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold leading-tight truncate max-w-[200px]" title={deal.title}>{deal.title}</h4>
                    <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                    {deal.value !== null && (
                        <div className="flex items-center gap-1">
                            <span className="text-primary font-bold">
                                ${typeof deal.value === "number" ? deal.value.toLocaleString() : "0"}
                            </span>
                        </div>
                    )}
                    {deal.probability !== null && (
                        <div className="flex items-center gap-1">
                            <span>{deal.probability}%</span>
                        </div>
                    )}
                </div>

                {deal.contactId && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground truncate">
                            Linked Contact
                        </span>
                    </div>
                )}
            </div>
        </COSCard>
    );
}
