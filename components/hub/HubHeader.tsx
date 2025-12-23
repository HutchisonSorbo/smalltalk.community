"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibilityPanel } from "@/components/vic-band/AccessibilityPanel";

export function HubHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
                         <span className="flex h-3 w-3 rounded-full bg-purple-500 animate-pulse"></span>
                         smalltalk.community
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        {/* Single "Sign Up" button pointing to global login, matching vic-band app header style */}
                         <Link href="/login">
                            <Button className="bg-white text-black hover:bg-neutral-200">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                    <ThemeToggle />
                    <AccessibilityPanel />
                    
                    {/* Mobile Login */}
                     <Link href="/login" className="sm:hidden">
                        <Button size="sm" variant="secondary">Sign Up</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
