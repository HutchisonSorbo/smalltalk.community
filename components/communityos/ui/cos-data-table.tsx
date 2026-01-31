"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

interface Column<T> {
    key: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    hideOnMobile?: boolean;
}

interface COSDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    searchable?: boolean;
    selectable?: boolean;
    pageSize?: number;
    className?: string;
}

export function COSDataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    searchable = true,
    selectable = false,
    pageSize = 10,
    className,
}: COSDataTableProps<T>) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());

    // Filter & Sort Logic
    const filteredData = React.useMemo(() => {
        let result = [...data];

        if (searchTerm) {
            result = result.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortKey) {
            result.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortKey, sortOrder]);

    // Reset to page 1 when filtered data changes
    const prevFilteredLength = React.useRef(filteredData.length);
    React.useEffect(() => {
        if (filteredData.length !== prevFilteredLength.current) {
            setCurrentPage(1);
            prevFilteredLength.current = filteredData.length;
        }
    }, [filteredData.length]);

    const totalPages = React.useMemo(() => Math.ceil(filteredData.length / pageSize), [filteredData.length, pageSize]);
    const paginatedData = React.useMemo(() => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredData, currentPage, pageSize]);

    const toggleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    return (
        <div className={cn("flex flex-col gap-4 w-full max-w-full", className)}>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {searchable && (
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search table..."
                            aria-label="Search data table"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 h-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                )}

                <div className="flex gap-2 w-full md:w-auto">
                    <button type="button" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border bg-background text-sm font-medium hover:bg-muted transition-colors">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                    <button type="button" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border bg-background text-sm font-medium hover:bg-muted transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" role="grid" aria-colcount={columns.length + (selectable ? 1 : 0)}>
                        <thead role="rowgroup">
                            <tr className="bg-muted/50 border-b" role="row">
                                {selectable && (
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            aria-label="Select all items on this page"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds(new Set(paginatedData.map(i => i.id)));
                                                } else {
                                                    setSelectedIds(new Set());
                                                }
                                            }}
                                        />
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        role="columnheader"
                                        aria-sort={sortKey === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                        className={cn(
                                            "px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors",
                                            col.hideOnMobile && "hidden md:table-cell"
                                        )}
                                        onClick={() => col.sortable && toggleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            {col.sortable && sortKey === col.key && (
                                                sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody role="rowgroup">
                            {paginatedData.map((item) => (
                                <tr
                                    key={item.id}
                                    role="row"
                                    aria-selected={selectedIds.has(item.id)}
                                    onClick={() => onRowClick?.(item)}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                                            e.preventDefault();
                                            onRowClick(item);
                                        }
                                    }}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    className={cn(
                                        "border-b last:border-0 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                                        onRowClick && "cursor-pointer",
                                        selectedIds.has(item.id) && "bg-primary/5"
                                    )}
                                >
                                    {selectable && (
                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(item.id)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                aria-label={`Select row ${item.id}`}
                                                onChange={(e) => {
                                                    const next = new Set(selectedIds);
                                                    if (e.target.checked) next.add(item.id);
                                                    else next.delete(item.id);
                                                    setSelectedIds(next);
                                                }}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={String(col.key)}
                                            className={cn(
                                                "px-4 py-4 text-sm font-medium max-w-[200px] truncate",
                                                col.hideOnMobile && "hidden md:table-cell"
                                            )}
                                        >
                                            <span className="truncate block">
                                                {col.render ? col.render(item) : String(item[col.key] ?? '')}
                                            </span>
                                        </td>
                                    ))}
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            type="button"
                                            className="p-1.5 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                                            aria-label="Item actions"
                                        >
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {paginatedData.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No matching results</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            We couldn&apos;t find any results matching your search terms. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4 border-t">
                    <p className="text-xs text-muted-foreground font-medium">
                        Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-foreground">{Math.min(currentPage * pageSize, filteredData.length)}</span> of <span className="text-foreground">{filteredData.length}</span> results
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border hover:bg-muted disabled:opacity-50 transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                // Show first few pages, and add ellipsis if needed
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                                            currentPage === pageNum ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                                        )}
                                        aria-label={`Page ${pageNum}`}
                                        aria-current={currentPage === pageNum ? "page" : undefined}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && (
                                <span className="px-2 text-muted-foreground">...</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border hover:bg-muted disabled:opacity-50 transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
