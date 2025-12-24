
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Music } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { searchLocations, type VictoriaLocation } from "@/lib/victoriaLocations";

export function GlobalSearch({ className, placeholder = "Search musicians, bands, locations..." }: { className?: string; placeholder?: string }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const router = useRouter();

    // Handle keyboard shortcut
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    const locationResults = React.useMemo(() => {
        if (query.trim().length === 0) return [];
        return searchLocations(query, 5);
    }, [query]);

    // If the user submits the search text directly
    const handleSearchSubmit = () => {
        if (!query) return;
        runCommand(() => router.push(`/search?q=${encodeURIComponent(query)}`));
    };

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    "relative w-full justify-start text-sm text-muted-foreground md:w-64 lg:w-96",
                    className
                )}
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">{placeholder}</span>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg">
                    <DialogTitle className="sr-only">Search musicians, bands, and locations</DialogTitle>
                    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                        <CommandInput
                            placeholder={placeholder}
                            value={query}
                            onValueChange={setQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchSubmit();
                                }
                            }}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {query.length > 0 && (
                                    <div className="p-2 cursor-pointer hover:bg-accent rounded-sm" onClick={handleSearchSubmit}>
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4" />
                                            <span>Search for <span className="font-bold">"{query}"</span></span>
                                        </div>
                                    </div>
                                )}
                                {query.length === 0 && "Start typing to search..."}
                            </CommandEmpty>

                            {locationResults.length > 0 && (
                                <CommandGroup heading="Locations">
                                    {locationResults.map((loc) => (
                                        <CommandItem
                                            key={`${loc.suburb}-${loc.postcode}`}
                                            value={loc.suburb} // Important for cmdk filtering/selection
                                            onSelect={() => {
                                                runCommand(() => router.push(`/search?location=${encodeURIComponent(loc.suburb)}`));
                                            }}
                                        >
                                            <MapPin className="mr-2 h-4 w-4" />
                                            <span>{loc.suburb}</span>
                                            <span className="ml-2 text-xs text-muted-foreground">{loc.region} {loc.postcode}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {query.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="General">
                                        <CommandItem
                                            value={`search:${query}`}
                                            onSelect={handleSearchSubmit}
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            <span>Search for "{query}"</span>
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
