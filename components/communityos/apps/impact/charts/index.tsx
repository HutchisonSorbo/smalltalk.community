"use client";

import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Shared color palette
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#ef4444", "#8b5cf6"];

// Centralized Styles
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border rounded-lg text-popover-foreground text-xs p-2 shadow-sm">
                <p className="font-semibold mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}: {entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const TOOLTIP_CURSOR = { fill: 'hsl(var(--muted) / 0.5)' };

/**
 * Common Props for all Impact Chart components.
 * @template T - The shape of the data entry.
 */
interface ChartProps<T> {
    title: string;
    description?: string;
    data: T[];
    className?: string;
    height?: number;
}

interface ChartCardProps {
    title: string;
    description?: string;
    className?: string;
    height: number;
    children: React.ReactNode;
}

function ChartCard({ title, description, className, height, children }: ChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="truncate">{title}</CardTitle>
                {description && <CardDescription className="truncate">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height }} role="img" aria-label={`Chart: ${title}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        {children as React.DetailedReactHTMLElement<any, HTMLElement>}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

interface BarChartProps<T> extends ChartProps<T> {
    xKey: keyof T & string;
    bars: { key: keyof T & string; name: string; color?: string }[];
}

export function ImpactBarChart<T extends Record<string, any>>({
    title,
    description,
    data,
    xKey,
    bars,
    className,
    height = 320
}: BarChartProps<T>) {
    return (
        <ChartCard title={title} description={description} className={className} height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    dataKey={xKey}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={TOOLTIP_CURSOR}
                />
                <Legend />
                {bars.map((bar, index) => (
                    <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        name={bar.name}
                        fill={bar.color || COLORS[index % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </BarChart>
        </ChartCard>
    );
}

interface PieChartProps<T> extends ChartProps<T> {
    nameKey: keyof T & string;
    valueKey: keyof T & string;
}

export function ImpactPieChart<T extends Record<string, any>>({
    title,
    description,
    data,
    nameKey,
    valueKey,
    className,
    height = 320
}: PieChartProps<T>) {
    return (
        <ChartCard title={title} description={description} className={className} height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey={valueKey}
                    nameKey={nameKey}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${entry[nameKey] || index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ChartCard>
    );
}

interface LineChartProps<T> extends ChartProps<T> {
    xKey: keyof T & string;
    lines: { key: keyof T & string; name: string; color?: string }[];
}

export function ImpactLineChart<T extends Record<string, any>>({
    title,
    description,
    data,
    xKey,
    lines,
    className,
    height = 320
}: LineChartProps<T>) {
    return (
        <ChartCard title={title} description={description} className={className} height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    dataKey={xKey}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {lines.map((line, index) => (
                    <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        name={line.name}
                        stroke={line.color || COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4, fill: line.color || COLORS[index % COLORS.length] }}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </LineChart>
        </ChartCard>
    );
}
