/**
 * Rostering App Component
 * A Ditto-enabled Rostering tool for managing shifts and assignments
 */

"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { CalendarView } from "./rostering/calendar-view";
import { AvailabilityGrid } from "./rostering/availability-grid";
import { Shift as CalendarShift } from "./rostering/shift-card";
import { Plus, Calendar as CalendarIcon, Users } from "lucide-react";
import { COSDataCard } from "../ui/cos-data-card";
import { COSSegmentedControl } from "../ui/cos-segmented-control";

interface Shift {
    id: string;
    workerName: string;
    role: string;
    startTime: string;
    endTime: string;
    status: "confirmed" | "pending" | "cancelled";
    location: string;
}

export function RosteringApp() {
    const { tenant, isLoading } = useTenant();
    const { documents: shifts, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<Shift>({
            collection: "rostering_shifts",
            tenantId: tenant?.id || ""
        });

    const [viewMode, setViewMode] = useState<"calendar" | "availability">("calendar");
    const [calendarViewMode, setCalendarViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Guard against missing tenant
    if (isLoading) {
        return <div className="p-4"><div className="h-6 w-48 rounded bg-gray-200 animate-pulse" /></div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load Rostering - Organisation context not available.</p>
            </div>
        );
    }

    // Map Ditto shifts to Calendar shifts
    const calendarShifts: CalendarShift[] = shifts.map(s => ({
        id: s.id,
        title: s.role,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        userName: s.workerName,
        status: s.status === 'confirmed' ? 'published' : s.status === 'pending' ? 'draft' : 'unfilled',
        location: s.location
    }));

    // Mock availability data
    const mockStaff = Array.from(new Set(shifts.map(s => s.workerName))).map(name => ({
        id: name,
        name: name
    }));

    // Create some fake availability for the demo based on the shifts
    const mockAvailability = shifts.map(s => ({
        userId: s.workerName,
        userName: s.workerName,
        date: new Date(s.startTime),
        status: 'available' as const
    }));

    const handleShiftMove = (shiftId: string, newDate: Date) => {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
            const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
            const newStart = newDate.toISOString();
            const newEnd = new Date(newDate.getTime() + duration).toISOString();

            upsertDocument(shiftId, {
                ...shift,
                startTime: newStart,
                endTime: newEnd
            });
        }
    };

    const handleAddShift = () => {
        const start = new Date(currentDate);
        start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setHours(17, 0, 0, 0);

        upsertDocument(crypto.randomUUID(), {
            workerName: "New Worker",
            role: "Volunteer",
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            status: "pending",
            location: "Main Hall"
        });
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rostering</h2>
                    <p className="text-gray-600 dark:text-gray-400">Schedule and manage community team rotations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <COSSegmentedControl
                        options={[
                            { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4 mr-2" /> },
                            { id: 'availability', label: 'Availability', icon: <Users className="w-4 h-4 mr-2" /> }
                        ]}
                        value={viewMode}
                        onChange={(val: any) => setViewMode(val)}
                    />

                    <button
                        onClick={handleAddShift}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shift
                    </button>

                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500 hidden sm:inline">{isOnline ? "Synced" : "Offline"}</span>
                    </div>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="flex-1 min-h-0">
                    <CalendarView
                        shifts={calendarShifts}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        viewMode={calendarViewMode}
                        onViewModeChange={setCalendarViewMode}
                        onShiftMove={handleShiftMove}
                        onShiftClick={(shift) => {
                            if (confirm('Delete this shift?')) {
                                deleteDocument(shift.id);
                            }
                        }}
                        className="h-full"
                    />
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-auto">
                    <COSDataCard title="Staff Availability" className="h-full">
                        <AvailabilityGrid
                            staff={mockStaff}
                            availability={mockAvailability}
                            startDate={currentDate}
                            days={14}
                        />
                    </COSDataCard>
                </div>
            )}
        </div>
    );
}
