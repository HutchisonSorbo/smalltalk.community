"use client";

import React from "react";
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
    <div className="grid border-b bg-muted/50 [grid-template-columns:var(--grid-cols)]" style={{ '--grid-cols': `200px repeat(${days}, 1fr)` } as React.CSSProperties}>
        <div className="p-3 font-semibold text-sm flex items-center border-r">Staff Member</div>
        {dates.map(date => (
            <div key={date.toISOString()} className="p-2 text-center border-r last:border-r-0">
                <div className="text-xs font-medium text-muted-foreground">{format(date, 'EEE')}</div>
                <div className="text-sm font-bold">{format(date, 'd')}</div>
            </div>
        ))}
    </div>
);

// Sub-component: Grid Row
const AvailabilityGridRow = ({
    person,
    dates,
    days,
    availability,
    getStatusColor,
    getStatusLabel
}: {
    person: { id: string; name: string },
    dates: Date[],
    days: number,
    availability: Availability[],
    getStatusColor: (status?: Availability['status']) => string,
    getStatusLabel: (status?: Availability['status']) => string
}) => (
    <div
        className="grid border-b last:border-b-0 hover:bg-muted/10 transition-colors [grid-template-columns:var(--grid-cols)]"
        style={{ '--grid-cols': `200px repeat(${days}, 1fr)` } as React.CSSProperties}
    >
        <div className="p-3 text-sm font-medium border-r flex items-center bg-card z-10 sticky left-0">
            {person.name}
        </div>
        {dates.map(date => {
            const entry = availability.find(a =>
                a.userId === person.id && isSameDay(a.date, date)
            );

            return (
                <div
                    key={`${person.id}-${date.toISOString()}`}
                    className="p-1 border-r last:border-r-0 h-12"
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
        <div className={cn("overflow-x-auto rounded-lg border bg-card", className)}>
            <div className="min-w-[800px]">
                <AvailabilityGridHeader dates={dates} days={clampedDays} />
                {staff.map(person => (
                    <AvailabilityGridRow
                        key={person.id}
                        person={person}
                        dates={dates}
                        days={clampedDays}
                        availability={availability}
                        getStatusColor={getStatusColor}
                        getStatusLabel={getStatusLabel}
                    />
                ))}
            </div>
        </div>
    );
}
