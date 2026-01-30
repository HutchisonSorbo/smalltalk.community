"use client";

import * as React from "react";
import { COSInput } from "../ui/cos-input";
import { Search, Loader2, User, DollarSign } from "lucide-react";
import { useTenant } from "../TenantProvider";
import { useDebouncedCrmSearch } from "@/hooks/use-debounced-crm-search";
import { cn } from "@/lib/utils";
import type { CrmSearchResults, CrmSearchContact, CrmSearchDeal } from "@/types/crm";

interface CRMSearchBarProps {
    onResultSelect: (type: "contact" | "deal", id: string) => void;
}

export function CRMSearchBar({ onResultSelect }: CRMSearchBarProps) {
    const { tenant } = useTenant();
    const {
        query,
        setQuery,
        results,
        isSearching,
        isOpen,
        setIsOpen,
        clearSearch
    } = useDebouncedCrmSearch({ organisationId: tenant?.id });

    return (
        <div className="relative w-full max-w-md group">
            <COSInput
                label=""
                placeholder="Search deals or contacts..."
                value={query}
                onChange={setQuery}
                icon={isSearching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />}
                clearable
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                aria-label="Search CRM deals and contacts"
                className="h-10"
            />

            {isOpen && results && (
                <CrmSearchResultsDropdown
                    results={results}
                    onSelect={(type, id) => {
                        onResultSelect(type, id);
                        clearSearch();
                    }}
                />
            )}
        </div>
    );
}

interface DropdownProps {
    results: CrmSearchResults;
    onSelect: (type: "contact" | "deal", id: string) => void;
}

function CrmSearchResultsDropdown({ results, onSelect }: DropdownProps) {
    const hasContacts = results.contacts.length > 0;
    const hasDeals = results.deals.length > 0;
    const hasAnyResults = hasContacts || hasDeals;

    return (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border bg-background/95 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="max-h-[320px] overflow-y-auto pr-1">
                {hasContacts && (
                    <div className="mb-3">
                        <div className="flex items-center gap-2 px-2 py-1 mb-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contacts</p>
                        </div>
                        {results.contacts.map((c: CrmSearchContact) => (
                            <button
                                key={c.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-left group/item"
                                onClick={() => onSelect("contact", c.id)}
                            >
                                <span className="truncate flex-1 font-medium">{c.firstName} {c.lastName}</span>
                                {c.email && <span className="text-[10px] text-muted-foreground ml-2 truncate max-w-[120px] opacity-0 group-hover/item:opacity-100 transition-opacity">{c.email}</span>}
                            </button>
                        ))}
                    </div>
                )}

                {hasDeals && (
                    <div>
                        <div className="flex items-center gap-2 px-2 py-1 mb-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deals</p>
                        </div>
                        {results.deals.map((d: CrmSearchDeal) => (
                            <button
                                key={d.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-left group/item"
                                onClick={() => onSelect("deal", d.id)}
                            >
                                <span className="truncate flex-1 font-medium">{d.title}</span>
                                {d.value !== null && (
                                    <span className="text-[10px] font-bold text-primary ml-2 shrink-0">
                                        ${typeof d.value === 'number' ? d.value.toLocaleString() : "0"}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {!hasAnyResults && (
                    <div className="py-8 px-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">No matches found</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
