
// CommunityOS App definitions
export interface CommunityOSApp {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: "operations" | "governance" | "programs" | "finance" | "admin" | "impact" | "automation";
    requiredRole?: "admin" | "board" | "member";
    /** Explicit item type for GenericCommunityApp, derived from name if not provided */
    itemType?: string;
}

export const communityOSApps: CommunityOSApp[] = [
    // Operations
    { id: "crm", name: "CRM", icon: "👥", description: "Manage contacts and members", category: "operations" },
    { id: "rostering", name: "Rostering", icon: "📅", description: "Schedule staff and volunteers", category: "operations" },
    { id: "communications", name: "Communications Hub", icon: "📢", description: "Internal communications", category: "operations" },
    { id: "assets", name: "Assets Inventory", icon: "📦", description: "Track organisational assets", category: "operations" },
    { id: "workflow", name: "Workflow Automation", icon: "⚡", description: "Automated triggers and actions", category: "automation" },

    // Programs
    { id: "events", name: "Events & Programs", icon: "🎉", description: "Manage events and programs", category: "programs" },
    { id: "lessons", name: "Lessons & Workshops", icon: "📚", description: "Educational programs", category: "programs" },
    { id: "learning", name: "Learning & Development", icon: "🎓", description: "Training and development", category: "programs" },
    { id: "projects", name: "Project Management", icon: "🏗️", description: "Manage projects", category: "programs" },

    // Governance
    { id: "governance", name: "Governance Compliance", icon: "⚖️", description: "Compliance and governance tools", category: "governance" },
    { id: "committee", name: "Committee Management", icon: "👔", description: "Manage board and committees", category: "governance" },
    { id: "meetings", name: "Meetings & Reporting", icon: "📝", description: "Meeting management", category: "governance" },
    { id: "policy", name: "Policy Library", icon: "📋", description: "Policies and procedures", category: "governance" },
    { id: "records", name: "Records & Privacy", icon: "🔒", description: "Records management", category: "governance" },
    { id: "risk", name: "Risk & Compliance", icon: "⚠️", description: "Risk management", category: "governance" },
    { id: "safeguarding", name: "Safeguarding Centre", icon: "🛡️", description: "Child safety and VCSS tracking", category: "governance" },

    // Finance
    { id: "financial", name: "Financial Management", icon: "💰", description: "Track finances and budgets", category: "finance" },
    { id: "fundraising", name: "Fundraising", icon: "🎁", description: "Fundraising and development", category: "finance" },

    // Admin
    { id: "impact", name: "Impact Reporting", icon: "📊", description: "Track and report outcomes", category: "admin" },
    { id: "partnerships", name: "Partnerships & MOUs", icon: "🤝", description: "Partnership management", category: "admin" },
    { id: "dashboard-org", name: "Organisation Dashboard", icon: "🏢", description: "Overview and analytics", category: "admin", requiredRole: "board" },
];
