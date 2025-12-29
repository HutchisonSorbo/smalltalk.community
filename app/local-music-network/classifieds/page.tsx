"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapPin, Music, Plus, Search, Calendar, User, Users } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Classified } from "@shared/schema";
import { instruments, genres, victoriaRegions } from "@shared/schema";

export default function ClassifiedsPage() {
    const [search, setSearch] = useState("");
    const [instrument, setInstrument] = useState<string>("all");
    const [type, setType] = useState<string>("all");

    const { data: classifieds, isLoading } = useQuery<Classified[]>({
        queryKey: ["/api/classifieds", search, instrument, type],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append("location", search); // Using search as location filter for MVP
            if (instrument && instrument !== "all") params.append("instrument", instrument);
            if (type && type !== "all") params.append("type", type);

            const res = await fetch(`/api/classifieds?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch classifieds");
            return res.json();
        }
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Digital Auditions</h1>
                        <p className="text-muted-foreground mt-1">Find your next band member or join a new project.</p>
                    </div>
                    <Button asChild>
                        <Link href="/classifieds/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Post Ad
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by location..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Ad Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="musician_wanted">Musician Wanted</SelectItem>
                            <SelectItem value="band_wanted">Band Wanted</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={instrument} onValueChange={setInstrument}>
                        <SelectTrigger>
                            <SelectValue placeholder="Instrument" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Instruments</SelectItem>
                            {instruments.map((inst) => (
                                <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Listings */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : classifieds?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Music className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No auditions found matching your criteria.</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/classifieds/new">Be the first to post!</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classifieds?.map((ad) => (
                            <Link key={ad.id} href={`/classifieds/${ad.id}`}>
                                <Card className="h-full hover-elevate transition-all cursor-pointer border-t-4 border-t-primary">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <Badge variant={ad.type === 'musician_wanted' ? 'default' : 'secondary'}>
                                                {ad.type === 'musician_wanted' ? 'Musician Wanted' : 'Band Wanted'}
                                            </Badge>
                                            {ad.createdAt && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="line-clamp-1 mt-2">{ad.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {ad.location}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {ad.instrument && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Music className="h-3 w-3" />
                                                    {ad.instrument}
                                                </Badge>
                                            )}
                                            {ad.genre && (
                                                <Badge variant="outline">
                                                    {ad.genre}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {ad.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between">

                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

// CodeRabbit Audit Trigger
