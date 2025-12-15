"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapPin, Search, Plus, Briefcase, Globe, Mail } from "lucide-react";
import { useState } from "react";
import { ProfessionalProfile, professionalRoles, victoriaRegions } from "@shared/schema";

export default function ProfessionalsPage() {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<string>("all");
    const [location, setLocation] = useState<string>("all");

    const { data: professionals, isLoading } = useQuery<ProfessionalProfile[]>({
        queryKey: ["/api/professionals", search, role, location],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append("query", search);
            if (role && role !== "all") params.append("role", role);
            if (location && location !== "all") params.append("location", location);

            const res = await fetch(`/api/professionals?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch professionals");
            return res.json();
        }
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Industry Professionals</h1>
                        <p className="text-muted-foreground mt-1">Connect with producers, photographers, teachers, and more.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services, names..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {professionalRoles.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Victoria</SelectItem>
                            {victoriaRegions.map((region) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Listings */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : professionals?.length === 0 ? (
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No professionals found matching your criteria.</p>
                    </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals?.map((pro) => (
                <Link key={pro.id} href={`/professionals/${pro.id}`}>
                    <Card className="h-full hover-elevate transition-all cursor-pointer border-t-4 border-t-purple-500">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                                    {pro.role}
                                </Badge>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {pro.location}
                                </div>
                            </div>
                            <CardTitle className="line-clamp-1">{pro.businessName || "Professional"}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {pro.services}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                {pro.bio}
                            </p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                {pro.rates && (
                                    <span className="bg-muted px-2 py-1 rounded">
                                        {pro.rates}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
            </main >
    <Footer />
        </div >
    );
}
