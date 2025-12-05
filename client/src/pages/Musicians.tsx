import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MusicianCard } from "@/components/MusicianCard";
import { FilterPanel } from "@/components/FilterPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { instruments, genres, experienceLevels, availabilityOptions, victoriaRegions } from "@shared/schema";
import type { MusicianProfile } from "@shared/schema";

export default function Musicians() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    instruments: [],
    genres: [],
    experienceLevel: [],
    availability: [],
    location: [],
  });

  const { data: musicians, isLoading } = useQuery<MusicianProfile[]>({
    queryKey: ["/api/musicians"],
  });

  const filterSections = [
    {
      id: "location",
      title: "Location",
      type: "select" as const,
      options: victoriaRegions.map((r) => ({ value: r, label: r })),
    },
    {
      id: "instruments",
      title: "Instruments",
      type: "checkbox" as const,
      options: instruments.map((i) => ({ value: i, label: i })),
    },
    {
      id: "genres",
      title: "Genres",
      type: "checkbox" as const,
      options: genres.map((g) => ({ value: g, label: g })),
    },
    {
      id: "experienceLevel",
      title: "Experience Level",
      type: "select" as const,
      options: experienceLevels.map((e) => ({ value: e, label: e })),
    },
    {
      id: "availability",
      title: "Availability",
      type: "select" as const,
      options: availabilityOptions.map((a) => ({ value: a, label: a })),
    },
  ];

  const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
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
      instruments: [],
      genres: [],
      experienceLevel: [],
      availability: [],
      location: [],
    });
  };

  const filteredMusicians = useMemo(() => {
    if (!musicians) return [];
    
    return musicians.filter((musician) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          musician.name.toLowerCase().includes(query) ||
          musician.bio?.toLowerCase().includes(query) ||
          musician.instruments?.some((i) => i.toLowerCase().includes(query)) ||
          musician.genres?.some((g) => g.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (selectedFilters.location?.length) {
        if (!musician.location || !selectedFilters.location.includes(musician.location)) {
          return false;
        }
      }

      if (selectedFilters.instruments?.length) {
        if (!musician.instruments?.some((i) => selectedFilters.instruments.includes(i))) {
          return false;
        }
      }

      if (selectedFilters.genres?.length) {
        if (!musician.genres?.some((g) => selectedFilters.genres.includes(g))) {
          return false;
        }
      }

      if (selectedFilters.experienceLevel?.length) {
        if (!musician.experienceLevel || !selectedFilters.experienceLevel.includes(musician.experienceLevel)) {
          return false;
        }
      }

      if (selectedFilters.availability?.length) {
        if (!musician.availability || !selectedFilters.availability.includes(musician.availability)) {
          return false;
        }
      }

      return true;
    });
  }, [musicians, searchQuery, selectedFilters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} searchPlaceholder="Search musicians..." />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Find Musicians</h1>
                <p className="text-muted-foreground">
                  Connect with talented musicians across Victoria
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
                      : `${filteredMusicians.length} musician${filteredMusicians.length !== 1 ? "s" : ""} found`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setMobileFiltersOpen(true)}
                    data-testid="button-mobile-filters"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-6 rounded-lg border bg-card">
                        <div className="flex flex-col items-center space-y-4">
                          <Skeleton className="h-24 w-24 rounded-full" />
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredMusicians.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No musicians found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMusicians.map((musician) => (
                      <MusicianCard key={musician.id} musician={musician} />
                    ))}
                  </div>
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
