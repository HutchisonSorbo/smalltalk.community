
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
    { id: "crm", name: "CRM", icon: "👥", description: "Manage contacts and members", category: "operations", itemType: "Contact" },
    { id: "rostering", name: "Rostering", icon: "📅", description: "Schedule staff and volunteers", category: "operations", itemType: "Shift" },
    { id: "communications", name: "Communications Hub", icon: "📢", description: "Internal communications", category: "operations", itemType: "Announcement" },
    { id: "assets", name: "Assets Inventory", icon: "📦", description: "Track organisational assets", category: "operations", itemType: "Asset" },
    { id: "workflow", name: "Workflow Automation", icon: "⚡", description: "Automated triggers and actions", category: "automation", itemType: "Workflow" },

    // Programs
    { id: "events", name: "Events & Programs", icon: "🎉", description: "Manage events and programs", category: "programs", itemType: "Event" },
    { id: "lessons", name: "Lessons & Workshops", icon: "📚", description: "Educational programs", category: "programs", itemType: "Lesson" },
    { id: "learning", name: "Learning & Development", icon: "🎓", description: "Training and development", category: "programs", itemType: "Course" },
    { id: "projects", name: "Project Management", icon: "🏗️", description: "Manage projects", category: "programs", itemType: "Project" },

    // Governance
    { id: "governance", name: "Governance Compliance", icon: "⚖️", description: "Compliance and governance tools", category: "governance", itemType: "Document" },
    { id: "committee", name: "Committee Management", icon: "👔", description: "Manage board and committees", category: "governance", itemType: "Member" },
    { id: "meetings", name: "Meetings & Reporting", icon: "📝", description: "Meeting management", category: "governance", itemType: "Meeting" },
    { id: "policy", name: "Policy Library", icon: "📋", description: "Policies and procedures", category: "governance", itemType: "Policy" },
    { id: "records", name: "Records & Privacy", icon: "🔒", description: "Records management", category: "governance", itemType: "Record" },
    { id: "risk", name: "Risk & Compliance", icon: "⚠️", description: "Risk management", category: "governance", itemType: "Risk" },
    { id: "safeguarding", name: "Safeguarding Centre", icon: "🛡️", description: "Child safety and VCSS tracking", category: "governance", itemType: "Report" },

    // Finance
    { id: "financial", name: "Financial Management", icon: "💰", description: "Track finances and budgets", category: "finance", itemType: "Transaction" },
    { id: "fundraising", name: "Fundraising", icon: "🎁", description: "Fundraising and development", category: "finance", itemType: "Campaign" },

    // Admin
    { id: "impact", name: "Impact Reporting", icon: "📊", description: "Track and report outcomes", category: "admin", itemType: "Metric" },
    { id: "partnerships", name: "Partnerships & MOUs", icon: "🤝", description: "Partnership management", category: "admin", itemType: "Partner" },
    { id: "dashboard-org", name: "Organisation Dashboard", icon: "🏢", description: "Overview and analytics", category: "admin", requiredRole: "board", itemType: "Widget" },
];
