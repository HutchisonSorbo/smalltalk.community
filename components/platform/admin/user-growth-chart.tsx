"use client";

import { useId } from "react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface UserGrowthData {
    date: string;
    users: number;
    label: string;
}

interface UserGrowthChartProps {
    data: UserGrowthData[];
    className?: string;
}

const chartConfig = {
    users: {
        label: "New Users",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function UserGrowthChart({ data, className }: UserGrowthChartProps) {
    // Generate unique ID to avoid gradient collisions when multiple charts render
    const uniqueId = useId();
    const gradientId = `fillUsers-${uniqueId.replace(/:/g, "")}`;

    if (!data.length) {
        return (
            <div
                className="flex items-center justify-center h-[200px] text-muted-foreground text-sm"
                role="img"
                aria-label="User growth chart: No data available for this period"
            >
                No data available for this period
            </div>
        );
    }

    const totalUsers = data.reduce((sum, point) => sum + point.users, 0);

    return (
        <div>
            {/* Accessible data table for screen readers */}
            <div className="sr-only">
                <table>
                    <caption>User growth data showing {totalUsers} new users</caption>
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">New Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((point) => (
                            <tr key={point.date}>
                                <td>{point.label}</td>
                                <td>{point.users}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Visual chart */}
            <ChartContainer
                config={chartConfig}
                className={className ?? "h-[200px]"}
                role="img"
                aria-label={`User growth chart showing ${totalUsers} new users over the selected period`}
            >
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-users)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-users)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        allowDecimals={false}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                        dataKey="users"
                        type="monotone"
                        fill={`url(#${gradientId})`}
                        stroke="var(--color-users)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
