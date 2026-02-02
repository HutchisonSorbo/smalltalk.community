"use client";

import { Clock, MapPin, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface Shift {
    id: string;
    title: string;
    start: Date;
    end: Date;
    userId?: string;
    userName?: string;
    userAvatar?: string;
    location?: string;
    status: 'published' | 'draft' | 'unfilled' | 'completed';
    isOvertime?: boolean;
}

interface ShiftCardProps {
    shift: Shift;
    onClick?: (shift: Shift) => void;
    className?: string;
}

export function ShiftCard({ shift, onClick, className }: ShiftCardProps) {
    const durationHours = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);

    const statusColor = {
        published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        unfilled: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    };

    const statusBorder = {
        published: "border-green-200 dark:border-green-800",
        draft: "border-gray-200 dark:border-gray-700",
        unfilled: "border-orange-200 dark:border-orange-800",
        completed: "border-blue-200 dark:border-blue-800"
    };

    return (
        <div
            onClick={() => onClick?.(shift)}
            className={cn(
                "group relative p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer",
                statusBorder[shift.status],
                shift.status === 'unfilled' && "border-dashed",
                className
            )}
            role="button"
            tabIndex={0}
            aria-label={`Shift: ${shift.title}, status: ${shift.status}, ${format(shift.start, 'h:mm a')} to ${format(shift.end, 'h:mm a')}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(shift);
                }
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm truncate pr-2" title={shift.title}>{shift.title}</h4>
                {shift.status === 'unfilled' ? (
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                ) : shift.status === 'published' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : null}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1.5" />
                    <span>
                        {format(shift.start, 'h:mm a')}
                        {" - "}
                        {format(shift.end, 'h:mm a')}
                        <span className="ml-1 opacity-70">({durationHours.toFixed(1)}h)</span>
                    </span>
                </div>

                {shift.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1.5" />
                        <span className="truncate">{shift.location}</span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-border">
                    {shift.userName ? (
                        <div className="flex items-center text-xs font-medium">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 text-[10px] text-primary">
                                {shift.userName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[100px]">{shift.userName}</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 font-medium">
                            <User className="h-3 w-3 mr-1.5" />
                            Unassigned
                        </div>
                    )}

                    {shift.isOvertime && (
                        <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded">
                            OT
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
