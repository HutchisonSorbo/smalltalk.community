"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LayoutGrid, Home, Grid2X2, MessageCircle, Bell, Info } from "lucide-react";
import { AccessibilityPanel } from "@/components/local-music-network/AccessibilityPanel";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PlatformHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = usePathname();
    const { user, isAuthenticated, isLoading } = useAuth();

    const { data: unreadData } = useQuery<{ count: number }>({
        queryKey: ["/api/messages/unread-count"],
        enabled: isAuthenticated,
        refetchInterval: 30000,
    });

    const { data: notificationsData } = useQuery<{ count: number }>({
        queryKey: ["/api/notifications/unread-count"],
        enabled: isAuthenticated,
        refetchInterval: 30000,
    });

    const unreadCount = unreadData?.count || 0;
    const unreadNotifications = notificationsData?.count || 0;
    const totalUnread = useMemo(() => unreadCount + unreadNotifications, [unreadCount, unreadNotifications]);

    const navLinks = [
        { href: "/hub", label: "Home", icon: Home },
        { href: "/about", label: "About", icon: Info },
        ...(isAuthenticated ? [
            { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
            { href: "/apps", label: "Apps", icon: Grid2X2 },
        ] : []),
    ];

    const isActive = (href: string) => location === href;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/hub" className="flex items-center gap-2" aria-label="Smalltalk Community Home">
                            <Logo className="h-8 w-auto" text="smalltalk.community" />
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Button
                                    key={link.href}
                                    variant={isActive(link.href) ? "secondary" : "ghost"}
                                    size="sm"
                                    className="gap-2"
                                    asChild
                                >
                                    <Link href={link.href}>
                                        {link.icon && <link.icon className="h-4 w-4" />}
                                        {link.label}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <AccessibilityPanel variant="inline" />
                        <ThemeToggle />

                        {isLoading ? (
                            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                        ) : isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="object-cover" />
                                            <AvatarFallback>
                                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {totalUnread > 0 && (
                                            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-medium text-white ring-2 ring-background">
                                                {totalUnread > 99 ? '99+' : totalUnread}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/notifications" className="cursor-pointer">
                                            <Bell className="mr-2 h-4 w-4" />
                                            Notifications
                                            {unreadNotifications > 0 && (
                                                <Badge variant="default" className="ml-auto text-xs">
                                                    {unreadNotifications}
                                                </Badge>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                    {(user.isAdmin || (user as any).roles?.includes("super_admin")) && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer font-semibold text-purple-600 focus:text-purple-600">
                                                <User className="mr-2 h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutGrid className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/messages" className="cursor-pointer">
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Messages
                                            {unreadCount > 0 && (
                                                <Badge variant="default" className="ml-auto text-xs">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <button
                                            onClick={() => {
                                                fetch("/api/logout", { method: "POST" })
                                                    .then(() => window.location.href = "/login");
                                            }}
                                            className="cursor-pointer w-full text-left flex items-center"
                                        >
                                            Log out
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 space-y-4">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href}>
                                    <Button
                                        variant={isActive(link.href) ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.icon && <link.icon className="h-4 w-4" />}
                                        {link.label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
