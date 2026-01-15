/**
 * TenantSwitcher Component
 * Dropdown for switching between tenants with Cmd+K keyboard shortcut
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Tenant } from "@/shared/schema";

interface TenantSwitcherProps {
    tenants: (Tenant & { role: string })[];
    currentTenant: Tenant;
}

export function TenantSwitcher({ tenants, currentTenant }: TenantSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter tenants by search
    const filteredTenants = tenants.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase())
    );

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            // Escape to close
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                setSearch("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleSelect = useCallback((tenant: Tenant) => {
        setIsOpen(false);
        setSearch("");
        router.push(`/communityos/${tenant.code}/dashboard`);
    }, [router]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
                <span className="font-medium text-gray-900 dark:text-white">
                    {currentTenant.name}
                </span>
                <span className="text-xs text-gray-400">⌘K</span>
                <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* Search */}
                    <div className="border-b p-2 dark:border-gray-700">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search organisations..."
                            className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
                        />
                    </div>

                    {/* Tenant List */}
                    <div className="max-h-64 overflow-y-auto p-1">
                        {filteredTenants.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No organisations found
                            </div>
                        ) : (
                            filteredTenants.map((tenant) => (
                                <button
                                    key={tenant.id}
                                    onClick={() => handleSelect(tenant)}
                                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${tenant.id === currentTenant.id ? "bg-primary/10" : ""
                                        }`}
                                >
                                    {tenant.logoUrl ? (
                                        <img
                                            src={tenant.logoUrl}
                                            alt=""
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium dark:bg-gray-600">
                                            {tenant.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-medium text-gray-900 dark:text-white">
                                            {tenant.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {tenant.role}
                                        </p>
                                    </div>
                                    {tenant.id === currentTenant.id && (
                                        <span className="text-primary">✓</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-2 dark:border-gray-700">
                        <a
                            href="/communityos"
                            className="block rounded-md px-3 py-2 text-center text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            + Join another organisation
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
