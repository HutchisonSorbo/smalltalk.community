import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { ListingCard } from "@/components/Local Music Network/ListingCard";
import { FilterPanel } from "@/components/Local Music Network/FilterPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { marketplaceCategories, itemConditions } from "@shared/schema";
import type { MarketplaceListing } from "@shared/schema";
import { victoriaLocations, victoriaRegions } from "@/lib/victoriaLocations";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    category: [],
    condition: [],
    location: [],
    priceRange: [],
  });

  const { data: listings, isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace"],
  });

  const filterSections = [
    {
      id: "location",
      title: "Location",
      type: "location" as const,
      options: [],
    },
    {
      id: "category",
      title: "Category",
      type: "checkbox" as const,
      options: marketplaceCategories.map((c) => ({ value: c, label: c })),
    },
    {
      id: "condition",
      title: "Condition",
      type: "checkbox" as const,
      options: itemConditions.map((c) => ({ value: c, label: c })),
    },
    {
      id: "priceRange",
      title: "Price Range ($)",
      type: "range" as const,
      options: [],
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
      category: [],
      condition: [],
      location: [],
      priceRange: [],
    });
  };

  const handleRangeChange = (sectionId: string, min: string, max: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [sectionId]: [min, max],
    }));
  };

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    
    return listings.filter((listing) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          listing.title.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedFilters.location?.length && selectedFilters.location[0]) {
        const filterValue = selectedFilters.location[0].trim();
        if (!filterValue) return true;
        if (!listing.location) return false;
        const listingLoc = listing.location.trim();
        const filterLower = filterValue.toLowerCase();
        const listingLower = listingLoc.toLowerCase();
        if (listingLower === filterLower) return true;
        const isFilterRegion = victoriaRegions.some(r => r.toLowerCase() === filterLower);
        if (isFilterRegion) {
          if (listingLower === filterLower) return true;
          const suburbInRegion = victoriaLocations.find(
            loc => loc.suburb.toLowerCase() === listingLower && loc.region.toLowerCase() === filterLower
          );
          if (suburbInRegion) return true;
          return false;
        }
        const filterSuburbData = victoriaLocations.find(loc => loc.suburb.toLowerCase() === filterLower);
        if (filterSuburbData) {
          if (listingLower === filterLower) return true;
          if (listingLower === filterSuburbData.region.toLowerCase()) return true;
          return false;
        }
        if (listingLower.includes(filterLower) || filterLower.includes(listingLower)) {
          return true;
        }
        return false;
      }

      if (selectedFilters.category?.length) {
        if (!selectedFilters.category.includes(listing.category)) {
          return false;
        }
      }

      if (selectedFilters.condition?.length) {
        if (!listing.condition || !selectedFilters.condition.includes(listing.condition)) {
          return false;
        }
      }

      const priceRange = selectedFilters.priceRange || [];
      const minStr = priceRange[0] || '';
      const maxStr = priceRange[1] || '';
      const min = minStr.trim() ? parseInt(minStr, 10) : undefined;
      const max = maxStr.trim() ? parseInt(maxStr, 10) : undefined;
      
      if ((min !== undefined && !isNaN(min)) || (max !== undefined && !isNaN(max))) {
        if (listing.price !== null && listing.price !== undefined) {
          if (min !== undefined && !isNaN(min) && listing.price < min) {
            return false;
          }
          if (max !== undefined && !isNaN(max) && listing.price > max) {
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    });
  }, [listings, searchQuery, selectedFilters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} searchPlaceholder="Search equipment, services..." />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Marketplace</h1>
                <p className="text-muted-foreground">
                  Buy and sell music equipment across Victoria
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
                onRangeChange={handleRangeChange}
                onClearAll={handleClearAll}
                mobileOpen={mobileFiltersOpen}
                onMobileOpenChange={setMobileFiltersOpen}
              />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {isLoading
                      ? "Loading..."
                      : `${filteredListings.length} listing${filteredListings.length !== 1 ? "s" : ""} found`}
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
                      <div key={i} className="rounded-lg border bg-card overflow-hidden">
                        <Skeleton className="aspect-[4/3] w-full" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-6 w-24" />
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
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
