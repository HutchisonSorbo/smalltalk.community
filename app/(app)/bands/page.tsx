"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BandCard } from "@/components/BandCard";
import type { Band } from "@shared/schema";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function BandsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery<Band[]>({
        queryKey: ["/api/bands", searchTerm],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const limit = 12;
            const url = `/api/bands?page=${pageParam}&limit=${limit}${searchTerm ? `&location=${encodeURIComponent(searchTerm)}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch bands");
            return res.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 12 ? allPages.length + 1 : undefined;
        },
    });

    const { isAuthenticated } = useAuth();
    const bands = data?.pages.flatMap((page) => page) || [];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Bands</h1>
                                <p className="text-muted-foreground">
                                    Discover local bands and groups available for gigs in Victoria.
                                </p>
                            </div>

                            {isAuthenticated && (
                                <Button asChild>
                                    <Link href="/bands/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Register Your Band
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

                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {status === 'pending' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-4 w-2/3 mx-auto" />
                                        <Skeleton className="h-4 w-1/2 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        ) : bands.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                    {bands.map((band) => (
                                        <BandCard key={band.id} band={band} />
                                    ))}
                                </div>
                                {hasNextPage && (
                                    <div className="flex justify-center mt-8">
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            variant="outline"
                                            size="lg"
                                        >
                                            {isFetchingNextPage ? "Loading more..." : "Load More Bands"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg mb-4">No bands found matching your search.</p>
                                {isAuthenticated && (
                                    <Button asChild variant="outline">
                                        <Link href="/bands/new">
                                            Be the first to list your band!
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
