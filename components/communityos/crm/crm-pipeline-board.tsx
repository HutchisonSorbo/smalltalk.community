"use client";

import * as React from "react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { COSCard } from "../ui/cos-card";
import { COSBadge } from "../ui/cos-badge";
import { MoreHorizontal, Plus, Users, DollarSign } from "lucide-react";
import { updateDealStage } from "@/lib/communityos/crm-actions";
import { toast } from "sonner";

interface Deal {
    id: string;
    title: string;
    value: string | null;
    probability: number | null;
    contactId: string | null;
    pipelineStageId: string;
    organisationId: string;
}

interface Stage {
    id: string;
    name: string;
    position: number;
    color: string | null;
}

interface Props {
    organisationId: string;
    stages: Stage[];
    initialDeals: Deal[];
    onDealClick?: (deal: Deal) => void;
    onAddDeal?: (stageId: string) => void;
}

export function CRMPipelineBoard({
    organisationId,
    stages,
    initialDeals,
    onDealClick,
    onAddDeal
}: Props) {
    const [deals, setDeals] = React.useState<Deal[]>(initialDeals);
    const [activeId, setActiveId] = React.useState<string | null>(null);

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

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeDeal = deals.find((d) => d.id === activeId);
        if (!activeDeal) return;

        // If dragging over a column (stage)
        const isOverColumn = stages.some((s) => s.id === overId);

        if (isOverColumn && activeDeal.pipelineStageId !== overId) {
            setDeals((prev) => {
                return prev.map((d) =>
                    d.id === activeId ? { ...d, pipelineStageId: overId as string } : d
                );
            });
            return;
        }

        // If dragging over another deal
        const overDeal = deals.find((d) => d.id === overId);
        if (overDeal && activeDeal.pipelineStageId !== overDeal.pipelineStageId) {
            setDeals((prev) => {
                return prev.map((d) =>
                    d.id === activeId ? { ...d, pipelineStageId: overDeal.pipelineStageId } : d
                );
            });
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeDeal = deals.find((d) => d.id === activeId);
        if (!activeDeal) return;

        let newStageId = activeDeal.pipelineStageId;

        // Check if we dropped on a column/stage ID directly
        if (stages.some(s => s.id === overId)) {
            newStageId = overId as string;
        } else {
            // Check if we dropped on another deal
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal) {
                newStageId = overDeal.pipelineStageId;
            }
        }

        // Persist change if stage changed
        const originalDeal = initialDeals.find(d => d.id === activeId);
        if (originalDeal && newStageId !== originalDeal.pipelineStageId) {
            try {
                const result = await updateDealStage(organisationId, activeId as string, newStageId);
                if (!result.success) {
                    toast.error(result.error);
                    // Revert state
                    setDeals(initialDeals);
                } else {
                    toast.success("Deal stage updated");
                }
            } catch (err) {
                toast.error("Failed to update deal stage");
                setDeals(initialDeals);
            }
        }

        if (activeId !== overId) {
            setDeals((items) => {
                const oldIndex = items.findIndex((i) => i.id === activeId);
                const newIndex = items.findIndex((i) => i.id === overId);
                // Guard against invalid indices
                if (oldIndex === -1 || newIndex === -1) {
                    return items;
                }
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-row gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] min-h-[500px]">
                {stages.map((stage) => (
                    <StageColumn
                        key={stage.id}
                        stage={stage}
                        deals={deals.filter((d) => d.pipelineStageId === stage.id)}
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
                {activeId ? (
                    <DealCard
                        deal={deals.find((d) => d.id === activeId)!}
                        isOverlay
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function StageColumn({ stage, deals, onDealClick, onAddDeal }: {
    stage: Stage;
    deals: Deal[];
    onDealClick?: (deal: Deal) => void;
    onAddDeal?: (stageId: string) => void;
}) {
    return (
        <div className="flex-shrink-0 w-80 flex flex-col gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color || "grey" }}
                    />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{stage.name}</h3>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
                        {deals.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onAddDeal?.(stage.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
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
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px]">
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

function SortableDealCard({ deal, onClick }: { deal: Deal; onClick?: () => void }) {
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

function DealCard({ deal, onClick, isOverlay }: { deal: Deal; onClick?: () => void; isOverlay?: boolean }) {
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
                    {deal.value && (
                        <div className="flex items-center gap-1">
                            <span className="text-primary font-bold">${parseFloat(deal.value).toLocaleString()}</span>
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
