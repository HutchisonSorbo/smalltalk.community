"use client"

import {
    Users,
    Music2,
    Mic2,
    Briefcase,
    Ticket,
    Search,
    LayoutDashboard,
    Settings,
    Megaphone,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Musicians",
        url: "/admin/musicians",
        icon: Music2,
    },
    {
        title: "Bands",
        url: "/admin/bands",
        icon: Mic2,
    },
    {
        title: "Professionals",
        url: "/admin/professionals",
        icon: Briefcase,
    },
    {
        title: "Gigs",
        url: "/admin/gigs",
        icon: Ticket,
    },
    {
        title: "Classifieds/Auditions",
        url: "/admin/auditions",
        icon: Mic2,
    },
    {
        title: "Announcements",
        url: "/admin/announcements",
        icon: Megaphone,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Local Music Network Admin</span>
                                    <span className="">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
