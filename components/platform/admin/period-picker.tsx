"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { PLATFORM_LAUNCH_DATE } from "@/lib/config";

export type PeriodValue = "7d" | "30d" | "90d" | "12m" | "all";

interface PeriodPickerProps {
    value: PeriodValue;
    onChange: (value: PeriodValue) => void;
    className?: string;
}

const periodOptions: { value: PeriodValue; label: string }[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "12m", label: "Last 12 months" },
    { value: "all", label: "All time" },
];

export function PeriodPicker({ value, onChange, className }: PeriodPickerProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={className ?? "w-[160px]"}>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
                {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Server-side utility to calculate date range from period
export function getDateRangeFromPeriod(period: PeriodValue): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
        case "7d":
            start.setDate(end.getDate() - 7);
            break;
        case "30d":
            start.setDate(end.getDate() - 30);
            break;
        case "90d":
            start.setDate(end.getDate() - 90);
            break;
        case "12m":
            start.setFullYear(end.getFullYear() - 1);
            break;
        case "all":
            // Use centralized platform launch date
            start.setTime(PLATFORM_LAUNCH_DATE.getTime());
            break;
    }

    return { start, end };
}
