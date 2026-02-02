
// CommunityOS App definitions
/**
 * Defines a custom field for a CommunityOS application.
 * This is the public API for defining dynamic form fields in apps.
 * 
 * @example
 * ```typescript
 * { id: "date", label: "Event Date", type: "date", required: true }
 * ```
 */
export interface CommunityOSAppField {
    /** Unique string identifier for the field, used as the key in metadata */
    id: string;
    /** Human-readable label displayed in the UI */
    label: string;
    /** The input type to render */
    type: "text" | "number" | "date" | "select" | "textarea";
    /** Optional array of options, required only when type is 'select' */
    options?: { label: string; value: string }[];
    /** Optional hint text displayed in empty inputs */
    placeholder?: string;
    /** Whether the field must be filled before saving */
    required?: boolean;
}

export interface CommunityOSApp {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: "operations" | "governance" | "programs" | "finance" | "admin" | "impact" | "automation";
    requiredRole?: "admin" | "board" | "member";
    /** Explicit item type for GenericCommunityApp, derived from name if not provided */
    itemType?: string;
    fields?: CommunityOSAppField[];
}

export const communityOSApps: CommunityOSApp[] = [
    // Operations
    { id: "crm", name: "CRM", icon: "👥", description: "Manage contacts and members", category: "operations", itemType: "Contact" },
    { id: "rostering", name: "Rostering", icon: "📅", description: "Schedule staff and volunteers", category: "operations", itemType: "Shift" },
    { id: "communications", name: "Communications Hub", icon: "📢", description: "Internal communications", category: "operations", itemType: "Announcement" },
    { id: "assets", name: "Assets Inventory", icon: "📦", description: "Track organisational assets", category: "operations", itemType: "Asset" },
    { id: "workflow", name: "Workflow Automation", icon: "⚡", description: "Automated triggers and actions", category: "automation", itemType: "Workflow" },

    // Programs
    {
        id: "events",
        name: "Events & Programs",
        icon: "🎉",
        description: "Manage events and programs",
        category: "programs",
        itemType: "Event",
        fields: [
            { id: "date", label: "Event Date", type: "date", required: true },
            { id: "location", label: "Location", type: "text", placeholder: "e.g. Community Hall" },
            { id: "capacity", label: "Capacity", type: "number" },
            {
                id: "category", label: "Category", type: "select", options: [
                    { label: "Workshop", value: "workshop" },
                    { label: "Community Meeting", value: "meeting" },
                    { label: "Social", value: "social" }
                ]
            }
        ]
    },
    { id: "lessons", name: "Lessons & Workshops", icon: "📚", description: "Educational programs", category: "programs", itemType: "Lesson" },
    { id: "learning", name: "Learning & Development", icon: "🎓", description: "Training and development", category: "programs", itemType: "Course" },
    {
        id: "projects",
        name: "Project Management",
        icon: "🏗️",
        description: "Manage projects",
        category: "programs",
        itemType: "Project",
        fields: [
            { id: "dueDate", label: "Due Date", type: "date" },
            {
                id: "priority", label: "Priority", type: "select", options: [
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" }
                ]
            },
            { id: "assignee", label: "Assignee", type: "text" }
        ]
    },

    // Governance
    { id: "governance", name: "Governance Compliance", icon: "⚖️", description: "Compliance and governance tools", category: "governance", itemType: "Document" },
    { id: "committee", name: "Committee Management", icon: "👔", description: "Manage board and committees", category: "governance", itemType: "Member" },
    { id: "meetings", name: "Meetings & Reporting", icon: "📝", description: "Meeting management", category: "governance", itemType: "Meeting" },
    { id: "policy", name: "Policy Library", icon: "📋", description: "Policies and procedures", category: "governance", itemType: "Policy" },
    { id: "records", name: "Records & Privacy", icon: "🔒", description: "Records management", category: "governance", itemType: "Record" },
    { id: "risk", name: "Risk & Compliance", icon: "⚠️", description: "Risk management", category: "governance", itemType: "Risk" },
    { id: "safeguarding", name: "Safeguarding Centre", icon: "🛡️", description: "Child safety and VCSS tracking", category: "governance", itemType: "Report" },

    // Finance
    {
        id: "financial",
        name: "Financial Management",
        icon: "💰",
        description: "Track finances and budgets",
        category: "finance",
        itemType: "Transaction",
        fields: [
            { id: "amount", label: "Amount", type: "number", required: true },
            { id: "date", label: "Date", type: "date", required: true },
            {
                id: "account", label: "Account", type: "select", options: [
                    { label: "Operations", value: "ops" },
                    { label: "Grants", value: "grants" },
                    { label: "Donations", value: "donations" }
                ]
            }
        ]
    },
    { id: "fundraising", name: "Fundraising", icon: "🎁", description: "Fundraising and development", category: "finance", itemType: "Campaign" },

    // Admin
    { id: "impact", name: "Impact Reporting", icon: "📊", description: "Track and report outcomes", category: "admin", itemType: "Metric" },
    { id: "partnerships", name: "Partnerships & MOUs", icon: "🤝", description: "Partnership management", category: "admin", itemType: "Partner" },
    { id: "hr", name: "People & Culture", icon: "🧑‍🤝‍🧑", description: "Personnel and HR management", category: "admin", requiredRole: "admin", itemType: "Personnel Record" },
    { id: "strategic", name: "Strategic Planning", icon: "🎯", description: "Goals and outcomes tracking", category: "admin", requiredRole: "board", itemType: "Objective" },
    { id: "facilities", name: "Facilities Management", icon: "🏠", description: "Maintenance and floorplans", category: "operations", itemType: "Facility" },
    { id: "research", name: "Research & Evaluation", icon: "🔬", description: "Program evaluation data", category: "programs", itemType: "Study" },
    { id: "dashboard-org", name: "Organisation Dashboard", icon: "🏢", description: "Overview and analytics", category: "admin", requiredRole: "board", itemType: "Widget" },
];
