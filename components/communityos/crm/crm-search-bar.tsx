"use client";

import * as React from "react";
import { COSInput } from "../ui/cos-input";
import { Search, Loader2 } from "lucide-react";
import { searchCrm } from "@/lib/communityos/crm-actions";
import { useTenant } from "../TenantProvider";
import { toast } from "sonner";
import type { CrmSearchResults, CrmSearchContact, CrmSearchDeal } from "@/types/crm";

interface CRMSearchBarProps {
    onResultSelect: (type: "contact" | "deal", id: string) => void;
}

export function CRMSearchBar({ onResultSelect }: CRMSearchBarProps) {
    const { tenant } = useTenant();
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<CrmSearchResults | null>(null);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSearch = React.useCallback(async (rawQuery: string) => {
        // Normalise query: trim whitespace and limit length
        const q = rawQuery.trim().slice(0, 100);
        if (!tenant?.id || q.length < 2) {
            setResults(null);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        setIsOpen(true);

        try {
            const res = await searchCrm(tenant.id, q);
            if (res.success) {
                setResults(res.data as CrmSearchResults);
            } else {
                toast.error(res.error ?? "Search failed");
                setResults(null);
            }
        } catch (err) {
            console.error("CRMSearchBar: handleSearch failed", err);
            toast.error("Search failed");
            setResults(null);
        } finally {
            setIsSearching(false);
        }
    }, [tenant?.id]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    return (
        <div className="relative w-full max-w-md">
            <COSInput
                label=""
                placeholder="Search deals or contacts..."
                value={query}
                onChange={setQuery}
                icon={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                clearable
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />

            {isOpen && results && (
                <div className="absolute top-full z-50 mt-2 w-full rounded-xl border bg-background p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                    {results.contacts.length > 0 && (
                        <div className="mb-2">
                            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contacts</p>
                            {results.contacts.map((c: CrmSearchContact) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors max-w-full"
                                    onClick={() => onResultSelect("contact", c.id)}
                                >
                                    <span className="truncate">{c.firstName} {c.lastName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {results.deals.length > 0 && (
                        <div>
                            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deals</p>
                            {results.deals.map((d: CrmSearchDeal) => (
                                <button
                                    key={d.id}
                                    type="button"
                                    className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors max-w-full"
                                    onClick={() => onResultSelect("deal", d.id)}
                                >
                                    <span className="truncate">{d.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {results.contacts.length === 0 && results.deals.length === 0 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">No results found</p>
                    )}
                </div>
            )}
        </div>
    );
}
