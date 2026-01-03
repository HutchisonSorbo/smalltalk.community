"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibilityPanel } from "@/components/local-music-network/AccessibilityPanel";

export function HubHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
                            smalltalk.community
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/hub"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            App Catalogue
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            About Us
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2 mr-2">
                            {/* Single "Sign Up" button pointing to global login, matching vic-band app header style */}
                            <Link href="/login">
                                <Button>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>

                        <div className="h-6 w-px bg-border hidden sm:block"></div>

                        <ThemeToggle />
                        <AccessibilityPanel variant="inline" />

                        {/* Mobile Login */}
                        <Link href="/login" className="sm:hidden">
                            <Button size="sm">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

// CodeRabbit Audit Trigger
