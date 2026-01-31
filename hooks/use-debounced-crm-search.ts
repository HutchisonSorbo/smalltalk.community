"use client";

import * as React from "react";
import { searchCrm } from "@/lib/communityos/crm-actions";
import { toast } from "sonner";
import type { CrmSearchResults } from "@/types/crm";

interface UseDebouncedCrmSearchProps {
    organisationId?: string;
    debounceMs?: number;
    minQueryLength?: number;
}

export function useDebouncedCrmSearch({
    organisationId,
    debounceMs = 300,
    minQueryLength = 2
}: UseDebouncedCrmSearchProps) {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<CrmSearchResults | null>(null);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSearch = React.useCallback(async (rawQuery: string) => {
        const q = rawQuery.trim().slice(0, 100);

        if (!organisationId || q.length < minQueryLength) {
            setResults(null);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        setIsOpen(true);

        try {
            const res = await searchCrm(organisationId, q);
            if (res.success) {
                setResults(res.data as CrmSearchResults);
            } else {
                toast.error(res.error ?? "Search failed");
                setResults(null);
            }
        } catch (err) {
            console.error("[useDebouncedCrmSearch] error:", err);
            toast.error("An error occurred while searching");
            setResults(null);
        } finally {
            setIsSearching(false);
        }
    }, [organisationId, minQueryLength]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [query, debounceMs, handleSearch]);

    const clearSearch = () => {
        setQuery("");
        setResults(null);
        setIsOpen(false);
    };

    return {
        query,
        setQuery,
        results,
        isSearching,
        isOpen,
        setIsOpen,
        clearSearch
    };
}
