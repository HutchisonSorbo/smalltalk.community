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
const TOOLTIP_CONTENT_STYLE = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '12px'
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
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height }} role="img" aria-label={`Bar chart: ${title}`}>
                    <ResponsiveContainer width="100%" height="100%">
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
                                contentStyle={TOOLTIP_CONTENT_STYLE}
                                cursor={TOOLTIP_CURSOR}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
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
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
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
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height }} role="img" aria-label={`Pie chart: ${title}`}>
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
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
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height }} role="img" aria-label={`Line chart: ${title}`}>
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
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
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
