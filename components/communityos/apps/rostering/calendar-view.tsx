"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { Shift, ShiftCard } from "./shift-card";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addDays, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid } from "lucide-react";

interface CalendarViewProps {
    shifts: Shift[];
    onShiftMove?: (shiftId: string, newDate: Date) => void;
    onShiftClick?: (shift: Shift) => void;
    viewMode?: 'week' | 'month';
    currentDate?: Date;
    onDateChange?: (date: Date) => void;
    onViewModeChange?: (mode: 'week' | 'month') => void;
    className?: string;
}

export function CalendarView({
    shifts,
    onShiftMove,
    onShiftClick,
    viewMode = 'week',
    currentDate = new Date(),
    onDateChange,
    onViewModeChange,
    className
}: CalendarViewProps) {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const days = React.useMemo(() => {
        if (viewMode === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end });
        } else {
            const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
            const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end });
        }
    }, [viewMode, currentDate]);

    const activeShift = React.useMemo(() =>
        shifts.find(s => s.id === activeId),
        [activeId, shifts]);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && onShiftMove) {
            const dateStr = over.id as string;
            const newDate = new Date(dateStr);
            const originalShift = shifts.find(s => s.id === active.id);

            if (originalShift) {
                // Keep original time, just update date
                const updatedDate = new Date(newDate);
                updatedDate.setHours(originalShift.start.getHours());
                updatedDate.setMinutes(originalShift.start.getMinutes());
                onShiftMove(String(active.id), updatedDate);
            }
        }

        setActiveId(null);
    };

    return (
        <div className={cn("flex flex-col h-full bg-background rounded-lg border", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateChange?.(addDays(currentDate, viewMode === 'week' ? -7 : -30))}
                        className="p-1 rounded hover:bg-muted"
                        title="Previous period"
                        aria-label="Previous period"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold min-w-[150px] text-center">
                        {format(currentDate, viewMode === 'week' ? 'MMM yyyy' : 'MMMM yyyy')}
                    </h3>
                    <button
                        onClick={() => onDateChange?.(addDays(currentDate, viewMode === 'week' ? 7 : 30))}
                        className="p-1 rounded hover:bg-muted"
                        title="Next period"
                        aria-label="Next period"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        onClick={() => onViewModeChange?.('week')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            viewMode === 'week' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => onViewModeChange?.('month')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            viewMode === 'month' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* Grid */}
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className={cn(
                    "grid flex-1 overflow-auto",
                    viewMode === 'week' ? "grid-cols-7" : "grid-cols-7 grid-rows-5"
                )}>
                    {/* Headers */}
                    {days.slice(0, 7).map(day => (
                        <div key={`header-${day.toISOString()}`} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r last:border-r-0 bg-muted/20">
                            {format(day, 'EEE')}
                        </div>
                    ))}

                    {/* Days */}
                    {days.map(day => (
                        <DroppableDay
                            key={day.toISOString()}
                            date={day}
                            shifts={shifts.filter(s => isSameDay(s.start, day))}
                            isCurrentMonth={isSameMonth(day, currentDate)}
                            viewMode={viewMode}
                            onShiftClick={onShiftClick}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeShift ? (
                        <div className="opacity-80 rotate-2 scale-105">
                            <ShiftCard shift={activeShift} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function DroppableDay({ date, shifts, isCurrentMonth, viewMode, onShiftClick }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: date.toISOString(),
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[120px] p-2 border-b border-r last:border-r-0 transition-colors",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isOver && "bg-primary/5 ring-2 ring-inset ring-primary/20",
                viewMode === 'week' ? "h-full" : "h-32 overflow-hidden"
            )}
        >
            <div className={cn(
                "text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full",
                isSameDay(date, new Date()) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}>
                {format(date, 'd')}
            </div>

            <div className="space-y-2">
                {shifts.map((shift: Shift) => (
                    <DraggableShift key={shift.id} shift={shift} onClick={onShiftClick} />
                ))}
            </div>
        </div>
    );
}

function DraggableShift({ shift, onClick }: { shift: Shift, onClick?: (s: Shift) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: shift.id,
    });

    if (isDragging) {
        return <div className="h-[80px] w-full bg-muted/20 rounded-lg border-2 border-dashed border-primary/20" />;
    }

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={{ touchAction: 'none' } as React.CSSProperties}>
            <ShiftCard shift={shift} onClick={onClick} />
        </div>
    );
}
