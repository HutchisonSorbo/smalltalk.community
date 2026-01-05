"use client";

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
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                No data available for this period
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className={className ?? "h-[200px]"}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#fillUsers)"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ChartContainer>
    );
}
