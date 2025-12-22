"use client";

// Imports and Header/Footer already there
import { useInfiniteQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Music, Search, Plus } from "lucide-react";


import { useAuth } from "@/hooks/useAuth";
import type { Gig } from "@shared/schema";
import Link from "next/link";
import { useState } from "react";
import { GigCard } from "@/components/GigCard";

export default function GigsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { isAuthenticated } = useAuth();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery<Gig[]>({
        queryKey: ["gigs", searchTerm],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: any }) => {
            const limit = 12;
            const params = new URLSearchParams({
                page: pageParam.toString(),
                limit: limit.toString(),
                date: 'upcoming'
            });
            if (searchTerm) params.append('location', searchTerm);

            const res = await fetch(`/api/gigs?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch gigs");
            return res.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 12 ? allPages.length + 1 : undefined;
        },
    });

    const gigs = data?.pages.flatMap((page) => page) || [];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Upcoming Gigs</h1>
                                <p className="text-muted-foreground">
                                    Find live music events near you.
                                </p>
                            </div>

                            {isAuthenticated && (
                                <Button asChild>
                                    <Link href="/gigs/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Post a Gig
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <div className="relative max-w-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by location..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="py-12 container mx-auto px-4">
                    {status === 'pending' ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {gigs.map((gig) => (
                                    <GigCard key={gig.id} gig={gig} />
                                ))}
                            </div>

                            {gigs.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No upcoming gigs found.
                                </div>
                            )}

                            {hasNextPage && (
                                <div className="flex justify-center mt-8">
                                    <Button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        variant="outline"
                                        size="lg"
                                    >
                                        {isFetchingNextPage ? "Loading more..." : "Load More Gigs"}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}


