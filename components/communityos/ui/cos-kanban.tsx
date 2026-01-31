"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { COSCard } from "./cos-card";
import { COSBadge } from "./cos-badge";
import { MoreHorizontal, Plus, GripVertical } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    useDroppable,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

export interface COSKanbanCard {
    id: string;
    title: string;
    subtitle?: string;
    status: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    assignee?: {
        name: string;
        avatar?: string;
    };
}

interface COSKanbanProps {
    columns: Array<{ id: string; title: string }>;
    cards: COSKanbanCard[];
    onMove: (cardId: string, newStatus: string) => void;
    onCardClick?: (card: COSKanbanCard) => void;
    onAddClick?: (status: string) => void;
    className?: string;
}

const COSKanbanCard = ({
    card,
    onClick,
    isDragging
}: {
    card: COSKanbanCard;
    onClick?: (card: COSKanbanCard) => void;
    isDragging?: boolean;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: card.id, data: { card } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        borderLeftColor: 'var(--card-priority-color)',
        opacity: isDragging ? 0.5 : 1,
        "--card-priority-color": card.priority === 'high' ? 'hsl(var(--destructive))' :
            card.priority === 'medium' ? 'hsl(var(--warning))' :
                'hsl(var(--primary))'
    } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="focus:outline-none">
            <COSCard
                variant="default"
                interactive
                onClick={() => onClick?.(card)}
                className={cn(
                    "p-4 border-l-4 group relative",
                    isDragging && "shadow-2xl scale-[1.02] ring-2 ring-primary/50"
                )}
            >
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <div {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <h4 className="text-sm font-semibold leading-tight truncate">{card.title}</h4>
                        </div>
                        {card.priority === 'high' && (
                            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse flex-shrink-0" />
                        )}
                    </div>

                    {card.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {card.subtitle}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {card.tags?.map((tag) => (
                            <COSBadge key={tag} size="sm" variant="info" className="opacity-80">
                                {tag}
                            </COSBadge>
                        ))}
                    </div>

                    {card.assignee && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50 min-w-0">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                {card.assignee.name.charAt(0)}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium truncate">
                                {card.assignee.name}
                            </span>
                        </div>
                    )}
                </div>
            </COSCard>
        </div>
    );
};

const COSKanbanColumn = ({
    column,
    columnCards,
    onAddClick,
    onCardClick
}: {
    column: { id: string; title: string };
    columnCards: COSKanbanCard[];
    onAddClick?: (status: string) => void;
    onCardClick?: (card: COSKanbanCard) => void;
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { status: column.id }
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-full md:w-80 flex flex-col gap-4 bg-muted/30 p-4 rounded-2xl border transition-colors",
                isOver && "bg-primary/5 border-primary/20"
            )}
        >
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-bold text-sm tracking-tight truncate">{column.title}</h3>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                        {columnCards.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => onAddClick?.(column.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label={`Add card to ${column.title}`}
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                        type="button"
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label={`Column options for ${column.title}`}
                    >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px]">
                <SortableContext
                    id={column.id}
                    items={columnCards.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {columnCards.map((card) => (
                        <COSKanbanCard
                            key={card.id}
                            card={card}
                            onClick={onCardClick}
                        />
                    ))}
                </SortableContext>

                {columnCards.length === 0 && !isOver && (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted/30">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                            Empty Column
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const COSKanban = ({ columns, cards, onMove, onCardClick, onAddClick, className }: COSKanbanProps) => {
    const [activeCard, setActiveCard] = React.useState<COSKanbanCard | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveCard(active.data.current?.card || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const cardId = active.id as string;
        const newStatus = over.data.current?.status || over.id as string;

        const card = cards.find(c => c.id === cardId);
        if (card && card.status !== newStatus) {
            onMove(cardId, newStatus);
        }
    };

    if (!mounted) {
        return (
            <div className={cn("flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 h-full", className)}>
                {columns.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-full md:w-80 h-[500px] bg-muted/20 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={cn("flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 h-full w-full custom-scrollbar", className)}>
                {columns.map((column) => {
                    const columnCards = cards.filter((card) => card.status === column.id);

                    return (
                        <COSKanbanColumn
                            key={column.id}
                            column={column}
                            columnCards={columnCards}
                            onAddClick={onAddClick}
                            onCardClick={onCardClick}
                        />
                    );
                })}
            </div>

            {mounted && createPortal(
                <DragOverlay dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeCard ? (
                        <div className="w-[320px] rotate-2 cursor-grabbing">
                            <COSKanbanCard card={activeCard} isDragging />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

export { COSKanban };
