"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Bell,
    Shield,
    Settings,
    History,
    LayoutDashboard,
    UserCheck,
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> { }

export function SidebarNav({ className, ...props }: SidebarNavProps) {
    const pathname = usePathname();

    const items = [
        {
            title: "Identity Verification",
            href: "/settings/identity",
            icon: UserCheck,
        },
        {
            title: "Settings Overview",
            href: "/settings",
            icon: LayoutDashboard,
        },
        {
            title: "Notifications",
            href: "/settings/notifications",
            icon: Bell,
        },
        {
            title: "Security & MFA",
            href: "/settings/security",
            icon: Shield,
        },
        {
            title: "Preferences",
            href: "/settings/preferences",
            icon: Settings,
        },
        {
            title: "Activity Log",
            href: "/settings/activity",
            icon: History,
        },
    ];

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {items.map((item) => {
                const isActive = item.href === "/settings"
                    ? pathname === "/settings"
                    : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            isActive
                                ? "bg-muted hover:bg-muted"
                                : "hover:bg-transparent hover:underline",
                            "justify-start"
                        )}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
