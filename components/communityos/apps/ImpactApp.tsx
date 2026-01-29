"use client";

import { useTenant } from "@/components/communityos/TenantProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, Award, Filter } from "lucide-react";
import { moderateContent } from "@/lib/utils/moderation";

const DATA_PARTICIPATION = [
    { month: "Jan", baseline: 45, growth: 12 },
    { month: "Feb", baseline: 52, growth: 15 },
    { month: "Mar", baseline: 48, growth: 22 },
    { month: "Apr", baseline: 61, growth: 30 },
    { month: "May", baseline: 55, growth: 42 },
    { month: "Jun", baseline: 67, growth: 55 },
];

const DATA_SKILLS = [
    { name: "Leadership", value: 35 },
    { name: "Communication", value: 42 },
    { name: "Technical", value: 28 },
    { name: "Teamwork", value: 45 },
    { name: "Problem Solving", value: 30 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];


function LoadingState() {
    return (
        <div className="p-4 space-y-4 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded" />)}
            </div>
            <div className="h-80 bg-gray-100 rounded" />
        </div>
    );
}

function ErrorState() {
    return (
        <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
            <p>Unable to load Impact Reporting - Organisation context not available.</p>
        </div>
    );
}

function ImpactHeader({ name }: { name: string }) {
    const moderatedName = moderateContent(name);
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Impact Reporting
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Measure and share the impact of {moderatedName} on the community.
                </p>
            </div>
            <button
                type="button"
                aria-label="Open filters"
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
                <Filter className="h-4 w-4" />
                Filters
            </button>
        </div>
    );
}

function KPICards() {
    const stats = [
        { title: "Total Participants", value: "1,284", sub: "+15% from last month", icon: Users, color: "text-green-600" },
        { title: "Volunteer Hours", value: "4,520", sub: "+8% from last month", icon: Clock, color: "text-green-600" },
        { title: "Digital Badges Issued", value: "312", sub: "Goal: 500 by Dec", icon: Award, color: "text-blue-600" },
        { title: "Impact Score", value: "4.8/5.0", sub: "Community Satisfaction", icon: TrendingUp, color: "text-muted-foreground", isPrimary: true }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, idx) => (
                <Card key={idx}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.isPrimary ? "text-primary" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className={`text-xs font-medium ${stat.color}`}>{stat.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function ChartsGrid() {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Program Participation Growth</CardTitle>
                    <CardDescription>Monthly engagement across all programs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DATA_PARTICIPATION}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                <Bar dataKey="baseline" name="Existing Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="growth" name="New Members" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top Skills Developed</CardTitle>
                    <CardDescription>Breakdown of skills gained by users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={DATA_SKILLS}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    aria-label="Skills distribution chart"
                                >
                                    {DATA_SKILLS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

export function ImpactApp() {
    const { tenant, isLoading } = useTenant();

    if (isLoading) return <LoadingState />;
    if (!tenant) return <ErrorState />;

    return (
        <div className="space-y-6 max-w-full">
            <ImpactHeader name={tenant.name} />
            <KPICards />
            <ChartsGrid />
        </div>
    );
}