"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export interface Availability {
    userId: string;
    userName: string;
    date: Date;
    status: 'available' | 'unavailable' | 'preference';
    note?: string;
}

interface AvailabilityGridProps {
    staff: Array<{ id: string; name: string }>;
    availability: Availability[];
    startDate?: Date;
    days?: number;
    className?: string;
}

// Sub-component: Grid Header
const AvailabilityGridHeader = ({ dates, days }: { dates: Date[], days: number }) => (
    <div
        role="row"
        className="grid border-b bg-muted/50 [grid-template-columns:var(--grid-cols)]"
        style={{ '--grid-cols': `200px repeat(${days}, 1fr)` } as React.CSSProperties}
    >
        <div role="columnheader" aria-colindex={1} className="p-3 font-semibold text-sm flex items-center border-r">Staff Member</div>
        {dates.map((date, idx) => (
            <div
                key={date.toISOString()}
                role="columnheader"
                aria-colindex={idx + 2}
                className="p-2 text-center border-r last:border-r-0"
            >
                <div className="text-xs font-medium text-muted-foreground">{format(date, 'EEE')}</div>
                <div className="text-sm font-bold">{format(date, 'd')}</div>
            </div>
        ))}
    </div>
);

// Sub-component: Grid Row
const AvailabilityGridRow = ({
    person,
    rowIndex,
    dates,
    days,
    availabilityMap,
    getStatusColor,
    getStatusLabel
}: {
    person: { id: string; name: string },
    rowIndex: number,
    dates: Date[],
    days: number,
    availabilityMap: Map<string, Availability>,
    getStatusColor: (status?: Availability['status']) => string,
    getStatusLabel: (status?: Availability['status']) => string
}) => (
    <div
        role="row"
        aria-rowindex={rowIndex}
        className="grid border-b last:border-b-0 hover:bg-muted/10 transition-colors [grid-template-columns:var(--grid-cols)]"
        style={{ '--grid-cols': `200px repeat(${days}, 1fr)` } as React.CSSProperties}
    >
        <div role="rowheader" className="p-3 text-sm font-medium border-r flex items-center bg-card z-10 sticky left-0">
            {person.name}
        </div>
        {dates.map((date, colIdx) => {
            const key = `${person.id}-${format(date, 'yyyy-MM-dd')}`;
            const entry = availabilityMap.get(key);

            return (
                <div
                    key={`${person.id}-${date.toISOString()}`}
                    role="gridcell"
                    aria-colindex={colIdx + 2}
                    tabIndex={0}
                    aria-label={`${person.name}, ${format(date, 'EEEE, d MMMM')}: ${entry ? entry.status : 'No input'}`}
                    className="p-1 border-r last:border-r-0 h-12 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                >
                    <div className={cn(
                        "w-full h-full rounded flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-help",
                        getStatusColor(entry?.status)
                    )}
                        title={entry?.note || entry?.status || "No input"}
                    >
                        {getStatusLabel(entry?.status)}
                    </div>
                </div>
            );
        })}
    </div>
);

export function AvailabilityGrid({
    staff,
    availability,
    startDate = new Date(),
    days = 7,
    className
}: AvailabilityGridProps) {
    const clampedDays = Math.min(days, 31);
    const start = startOfWeek(startDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: clampedDays }, (_, i) => addDays(start, i));

    const availabilityMap = useMemo(() => {
        const map = new Map<string, Availability>();
        availability.forEach(a => {
            const key = `${a.userId}-${format(a.date, 'yyyy-MM-dd')}`;
            map.set(key, a);
        });
        return map;
    }, [availability]);

    const getStatusColor = (status?: Availability['status']) => {
        switch (status) {
            case 'available': return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
            case 'unavailable': return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
            case 'preference': return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
            default: return "bg-muted/30 text-muted-foreground";
        }
    };

    const getStatusLabel = (status?: Availability['status']) => {
        switch (status) {
            case 'available': return "✓";
            case 'unavailable': return "✕";
            case 'preference': return "★";
            default: return "-";
        }
    };

    return (
        <div
            role="grid"
            aria-label="Staff Availability Grid"
            className={cn("overflow-x-auto rounded-lg border bg-card max-w-full", className)}
        >
            <div className="min-w-[800px]" role="presentation">
                <AvailabilityGridHeader dates={dates} days={clampedDays} />
                {staff.map((person, idx) => (
                    <AvailabilityGridRow
                        key={person.id}
                        person={person}
                        rowIndex={idx + 2} // Header is index 1
                        dates={dates}
                        days={clampedDays}
                        availabilityMap={availabilityMap}
                        getStatusColor={getStatusColor}
                        getStatusLabel={getStatusLabel}
                    />
                ))}
            </div>
        </div>
    );
}
