import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { ProfessionalCard } from "@/components/local-music-network/ProfessionalCard";
import { FilterPanel } from "@/components/local-music-network/FilterPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { professionalRoles } from "@shared/schema";
import type { ProfessionalProfile } from "@shared/schema";

export default function Professionals() {
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        role: [],
        location: [],
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery<ProfessionalProfile[]>({
        queryKey: ["/api/professionals", searchQuery, selectedFilters],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }: { pageParam: any }) => {
            const limit = 12;
            const offset = pageParam * limit; // storage uses offset, but infinite query usually tracks pages. 
            // Checking storage.ts: getProfessionalProfiles uses limit/offset.
            // API route uses limit/offset derived from query params??
            // Let's check api/professionals route again. It takes limit. It doesn't seem to explicitly take offset/page?
            // Wait, storage.ts supports offset. api/professionals ROUTE takes 'limit', but DOES IT TAKE OFFSET?
            // Re-reading api/professionals/route.ts:
            // const filters = { ..., limit: ... } -> It does NOT parse offset/page!
            // I need to update the API route to support offset/page if I want infinite scroll to work correctly.
            // For now, I will assume it renders everything or I'll fix the API route next. 
            // Actually Musicians API handled it:
            // Musicians API: header indicates pagination?
            // Let's check Musicians API route implementation first to be consistent. 

            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (pageParam * limit).toString() // Attempting to send offset
            });

            if (searchQuery) params.append("query", searchQuery);
            if (selectedFilters.location?.length) params.append("location", selectedFilters.location[0]);
            if (selectedFilters.role?.length && selectedFilters.role[0] !== "all") params.append("role", selectedFilters.role[0]);

            const res = await fetch(`/api/professionals?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch professionals");
            return res.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 12 ? allPages.length : undefined;
        },
    });

    const professionals = data?.pages.flatMap((page) => page) || [];

    const filterSections = [
        {
            id: "location",
            title: "Location",
            type: "location" as const,
            options: [],
        },
        {
            id: "role",
            title: "Role",
            type: "select" as const,
            options: professionalRoles.map((r) => ({ value: r, label: r })),
        },
    ];

    const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
        // For Select/Location types which are single value in our logic (mostly), we might handle differently
        // But FilterPanel passes these via specific handlers usually?
        // FilterPanel uses 'onSelectChange' for select/location.
        // This handler is for checkboxes.
        setSelectedFilters((prev) => ({
            ...prev,
            [sectionId]: checked
                ? [...(prev[sectionId] || []), value]
                : (prev[sectionId] || []).filter((v) => v !== value),
        }));
    };

    const handleSelectChange = (sectionId: string, value: string) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [sectionId]: value === "all" ? [] : [value],
        }));
    };

    const handleClearAll = () => {
        setSelectedFilters({
            role: [],
            location: [],
        });
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header onSearch={setSearchQuery} searchPlaceholder="Search professionals..." />

            <main className="flex-1">
                <section className="bg-gradient-to-br from-purple-50 via-background to-purple-50/50 py-8 dark:from-purple-950/20 dark:to-purple-950/10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Industry Professionals</h1>
                                <p className="text-muted-foreground">
                                    Connect with producers, teachers, and industry experts
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-8">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-8">
                            <FilterPanel
                                sections={filterSections}
                                selectedFilters={selectedFilters}
                                onFilterChange={handleFilterChange}
                                onSelectChange={handleSelectChange}
                                onClearAll={handleClearAll}
                                mobileOpen={mobileFiltersOpen}
                                onMobileOpenChange={setMobileFiltersOpen}
                            />

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-muted-foreground">
                                        {isLoading
                                            ? "Loading..."
                                            : `${professionals.length} professional${professionals.length !== 1 ? "s" : ""} found`}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="lg:hidden"
                                        onClick={() => setMobileFiltersOpen(true)}
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
                                </div>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="h-[300px] rounded-lg border bg-card animate-pulse" />
                                        ))}
                                    </div>
                                ) : professionals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
                                        <p className="text-muted-foreground">
                                            Try adjusting your filters or search query
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                            {professionals.map((pro) => (
                                                <ProfessionalCard key={pro.id} professional={pro} />
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
                                                    {isFetchingNextPage ? "Loading more..." : "Load More Professionals"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
