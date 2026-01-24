/**
 * Tenant Data Template for White-Label CommunityOS
 * Generic placeholder content for new organisations
 */

import type { TenantData } from "./tenantData";

// Template with placeholder content for tenant customization
export const defaultTenantData: TenantData = {
    organisation: {
        name: "[Your Organisation Name]",
        type: "[Legal Structure, e.g., Incorporated Association]",
        status: "[Status, e.g., Established 2024]",
        planPeriod: "[Plan Period, e.g., 2024-2026]",
        vision: "[Your Vision Statement - What future do you want to create?]",
        mission: "[Your Mission Statement - How will you achieve your vision?]",
        values: [
            { title: "[Value 1]", icon: "🌟", description: "[Description of this core value]" },
            { title: "[Value 2]", icon: "🤝", description: "[Description of this core value]" },
            { title: "[Value 3]", icon: "💎", description: "[Description of this core value]" },
            { title: "[Value 4]", icon: "🛡️", description: "[Description of this core value]" },
        ],
        founder: {
            name: "[Founder Name]",
            role: "[Role]",
            email: "[email@example.com]",
            bio: "[Brief bio of the founder]",
            why: "[Why they started this organisation]",
        },
        cofounder: {
            name: "[Co-founder Name]",
            role: "[Role]",
            bio: "[Brief bio of the co-founder]",
            protections: "[Relevant protections or governance notes]",
        },
    },
    constitution: {
        parts: [
            { id: "part1", title: "Identity & Purpose", clauses: [1, 2, 3] },
            { id: "part2", title: "Membership", clauses: [4, 5] },
            { id: "part3", title: "Governance", clauses: [6, 7] },
        ],
        clauses: {
            1: { title: "Name", content: "[Official name clause]", plain: "[Plain English explanation]" },
            2: { title: "Purpose", content: "[Purpose clause]", plain: "[Plain English explanation]" },
            3: { title: "Not-for-Profit", content: "[NFP clause]", plain: "[Plain English explanation]" },
            4: { title: "Membership Types", content: "[Membership clause]", plain: "[Plain English explanation]" },
            5: { title: "Joining", content: "[How to join]", plain: "[Plain English explanation]" },
            6: { title: "Committee", content: "[Committee structure]", plain: "[Plain English explanation]" },
            7: { title: "Meetings", content: "[Meeting requirements]", plain: "[Plain English explanation]" },
        },
    },
    strategicPlan: {
        pillars: [
            {
                id: 1,
                title: "[Strategic Pillar 1]",
                subtitle: "[Subtitle]",
                description: "[Description of this strategic priority]",
                icon: "🎯",
                status: "planned",
                priorities: [
                    { name: "[Priority 1]", desc: "[Description]", phase: "Year 1" },
                ],
            },
        ],
        timeline: [
            {
                phase: 1,
                name: "[Phase Name]",
                period: "[Timeframe]",
                icon: "🏗️",
                status: "current",
                description: "[What happens in this phase]",
                focus: "[Key focus area]",
                milestones: [
                    { category: "[CATEGORY]", item: "[Milestone]", status: "todo" },
                ],
            },
        ],
        boardRoles: [
            {
                id: "chair",
                title: "Chair",
                icon: "👑",
                timeCommitment: "[X hrs/month]",
                purpose: "[Role purpose]",
                responsibilities: ["[Responsibility 1]", "[Responsibility 2]"],
                idealBackground: "[Ideal background]",
                isNot: "[What this role is not]",
            },
        ],
        risks: [
            { id: 1, cat: "[CATEGORY]", name: "[Risk Name]", risk: "[Risk description]", impact: 3, likelihood: 3, mitigation: "[Mitigation strategy]" },
        ],
    },
    operationalFramework: {
        governanceCalendar: [
            { month: "[Month Year]", events: ["[Event 1]", "[Event 2]"] },
        ],
        geographicalFirewall: {
            primaryFocus: "[Region/Area]",
            majorTowns: ["[Town 1]", "[Town 2]"],
            context: "[Context about the region]",
        },
        founderCapacity: {
            rule: "[Capacity Rule]",
            description: "[Description]",
            trafficLights: [
                { color: "Green", range: "[Range]", status: "[Status]" },
                { color: "Yellow", range: "[Range]", status: "[Status]" },
                { color: "Red", range: "[Range]", status: "[Status]" },
            ],
        },
    },
    safeguarding: {
        headline: "[Safeguarding Headline]",
        status: "[Current Status]",
        statusNote: "[Status explanation]",
        commitments: [
            { title: "[Commitment 1]", desc: "[Description]" },
        ],
        policies: [
            { title: "[Policy 1]", content: "[Policy content]" },
        ],
        realityCheck: "[Honest statement about safeguarding limitations and approach]",
    },
    getInvolved: [
        {
            title: "[Opportunity Title]",
            role: "[Role Type]",
            shortDesc: "[Short description]",
            fullDesc: "[Full description of the opportunity]",
            requirements: ["[Requirement 1]", "[Requirement 2]"],
            benefits: ["[Benefit 1]", "[Benefit 2]"],
            cta: "Learn More",
            emailSubject: "[Email Subject]",
        },
    ],
};

/**
 * Helper to check if a string is placeholder template data (e.g., "[Your Name]")
 */
export function isTemplateData(value: string | undefined | null): boolean {
    if (!value) return false;
    return value.trim().startsWith("[") && value.trim().endsWith("]");
}

/**
 * Returns a list of section IDs that contain unconfigured template data
 */
export function getUnconfiguredSections(data: TenantData): string[] {
    const unconfigured: Set<string> = new Set();

    // Check Organisation
    if (isTemplateData(data.organisation.name) ||
        isTemplateData(data.organisation.vision) ||
        isTemplateData(data.organisation.mission)) {
        unconfigured.add("overview");
    }

    // Check Constitution
    const firstClause = data.constitution.clauses[1];
    if (firstClause && isTemplateData(firstClause.content)) {
        unconfigured.add("constitution");
    }

    // Check Strategic Plan
    if (data.strategicPlan.pillars.length === 1 && isTemplateData(data.strategicPlan.pillars[0].title)) {
        unconfigured.add("strategy");
    }

    if (data.strategicPlan.boardRoles.length === 1 && isTemplateData(data.strategicPlan.boardRoles[0].title)) {
        unconfigured.add("board-roles");
    }

    if (data.strategicPlan.risks.length === 1 && isTemplateData(data.strategicPlan.risks[0].name)) {
        unconfigured.add("risks");
    }

    // Check Operations
    if (isTemplateData(data.operationalFramework.geographicalFirewall.primaryFocus)) {
        unconfigured.add("operations");
    }

    // Check Safeguarding
    if (isTemplateData(data.safeguarding.headline)) {
        unconfigured.add("safeguarding");
    }

    // Check Involved
    if (data.getInvolved.length === 1 && isTemplateData(data.getInvolved[0].title)) {
        unconfigured.add("involved");
    }

    return Array.from(unconfigured);
}
