"use client"

import {
    Users,
    LayoutDashboard,
    ClipboardList,
    Flag,
    AppWindow,
    TrendingUp,
    Download,
    Shield,
    Activity,
    UserCog,
    FileText,
    Megaphone,
    Settings,
    ToggleLeft,
    Database,
    Building2,
    ChevronDown,
    Mail,
    MessageSquare,
    Lock,
    AlertTriangle,
    Key,
    FileCheck,
    Wrench,
    UserX,
    History,
    Send,
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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const overviewItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Activity Log",
        url: "/admin/activity",
        icon: Activity,
    },
]

const userItems = [
    {
        title: "All Users",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Bulk Actions",
        url: "/admin/users/bulk",
        icon: UserX,
    },
    {
        title: "Roles & Permissions",
        url: "/admin/roles",
        icon: UserCog,
    },
]

const contentItems = [
    {
        title: "Content Overview",
        url: "/admin/content",
        icon: Database,
    },
    {
        title: "Moderation Queue",
        url: "/admin/moderation",
        icon: Flag,
    },
    {
        title: "Reports",
        url: "/admin/reports",
        icon: AlertTriangle,
    },
    {
        title: "Announcements",
        url: "/admin/announcements",
        icon: Megaphone,
    },
    {
        title: "Onboarding Data",
        url: "/admin/onboarding",
        icon: ClipboardList,
    },
]

const securityItems = [
    {
        title: "Security Dashboard",
        url: "/admin/security",
        icon: Shield,
    },
    {
        title: "Failed Logins",
        url: "/admin/security/failed-logins",
        icon: Lock,
    },
    {
        title: "IP Allowlist",
        url: "/admin/security/ip-allowlist",
        icon: Key,
    },
    {
        title: "Audit Log",
        url: "/admin/security/audit",
        icon: FileCheck,
    },
]

const communicationsItems = [
    {
        title: "Mass Messaging",
        url: "/admin/communications",
        icon: Send,
    },
    {
        title: "Email Templates",
        url: "/admin/communications/templates",
        icon: Mail,
    },
    {
        title: "Message History",
        url: "/admin/communications/history",
        icon: History,
    },
]

const appItems = [
    {
        title: "App Registry",
        url: "/admin/apps",
        icon: AppWindow,
    },
    {
        title: "Organisations",
        url: "/admin/organisations",
        icon: Building2,
    },
]

const analyticsItems = [
    {
        title: "Metrics & Analytics",
        url: "/admin/metrics",
        icon: TrendingUp,
    },
    {
        title: "Export Data",
        url: "/admin/export",
        icon: Download,
    },
]

const settingsItems = [
    {
        title: "Site Settings",
        url: "/admin/settings",
        icon: Settings,
    },
    {
        title: "Feature Flags",
        url: "/admin/settings/features",
        icon: ToggleLeft,
    },
    {
        title: "Maintenance Mode",
        url: "/admin/system/maintenance",
        icon: Wrench,
    },
]

interface NavSection {
    label: string
    items: {
        title: string
        url: string
        icon: React.ComponentType<{ className?: string }>
    }[]
}

const navSections: NavSection[] = [
    { label: "Overview", items: overviewItems },
    { label: "Users & Access", items: userItems },
    { label: "Content", items: contentItems },
    { label: "Security", items: securityItems },
    { label: "Communications", items: communicationsItems },
    { label: "Apps", items: appItems },
    { label: "Analytics", items: analyticsItems },
    { label: "System", items: settingsItems },
]

export function PlatformAdminSidebar() {
    const pathname = usePathname()

    const isActive = (url: string) => {
        if (url === "/admin") return pathname === "/admin"
        return pathname.startsWith(url)
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Platform Admin</span>
                                    <span className="text-xs text-muted-foreground">smalltalk.community</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navSections.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                            <Link href={item.url}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
