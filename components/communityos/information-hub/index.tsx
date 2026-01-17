"use client";

/**
 * Information Hub Component
 * Central governance and strategic information hub with expandable sections
 */

import { useState } from "react";
import { safeUrl } from "@/lib/utils";
import { stcTenantData } from "./data/tenantData";
import { defaultTenantData } from "./data/tenantDataTemplate";
import type { TenantData } from "./data/tenantData";

// Get tenant data based on tenant code
function getTenantData(tenantCode: string): TenantData {
    switch (tenantCode) {
        case "stc":
            return stcTenantData;
        default:
            return defaultTenantData;
    }
}

interface InformationHubProps {
    /** The tenant code used to fetch tenant-specific data */
    tenantCode: string;
    /** If true, shows a condensed view with category buttons to expand sections */
    condensed?: boolean;
}

// Expandable section wrapper
function Section({
    id,
    title,
    icon,
    children,
    defaultOpen = false,
}: {
    id: string;
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`section-${id}`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">{icon}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </span>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                    ▼
                </span>
            </button>
            {isOpen && (
                <div id={`section-${id}`} className="border-t border-gray-200 p-4 dark:border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
}

// Constitution clause component
function ConstitutionClause({
    number,
    title,
    content,
    plain,
}: {
    number: number;
    title: string;
    content: string;
    plain: string;
}) {
    const [showPlain, setShowPlain] = useState(false);

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0 dark:border-gray-700">
            <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {number}
                </span>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {showPlain ? plain : content}
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowPlain(!showPlain)}
                        className="mt-1 text-xs text-primary hover:underline"
                    >
                        {showPlain ? "Show full text" : "Plain English"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * InformationHub component displays governance, strategy, and organisational information
 * for a specific tenant. Uses {@link getTenantData} to fetch tenant-specific data based
 * on the provided tenant code.
 *
 * @param props - The component props
 * @param props.tenantCode - The unique code identifying the tenant (e.g., "stc")
 * @param props.condensed - If true, shows a condensed view with category buttons
 * @returns A React element containing expandable sections for organisation overview,
 *          constitution, strategic direction, safeguarding, get involved, operations,
 *          risk register, and board roles
 */
export function InformationHub({ tenantCode, condensed = false }: InformationHubProps): React.ReactElement {
    const data = getTenantData(tenantCode);
    const { organisation, constitution, strategicPlan, safeguarding, getInvolved, operationalFramework } = data;

    // For condensed mode, track which section is expanded
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Section definitions for condensed view
    const sections = [
        { id: "overview", title: "About", icon: "🏠" },
        { id: "constitution", title: "Constitution", icon: "⚖️" },
        { id: "strategy", title: "Strategy", icon: "🗺️" },
        { id: "safeguarding", title: "Safeguarding", icon: "🛡️" },
        { id: "involved", title: "Get Involved", icon: "🙋" },
        { id: "operations", title: "Operations", icon: "⚙️" },
        { id: "risks", title: "Risks", icon: "⚠️" },
        { id: "board-roles", title: "Board", icon: "👔" },
    ];

    // Helper to render section content
    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case "overview":
                return (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                            <h3 className="text-xl font-bold text-primary dark:text-white">{organisation.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{organisation.type}</p>
                            <div className="mt-4 space-y-2">
                                <p><strong>Vision:</strong> {organisation.vision}</p>
                                <p><strong>Mission:</strong> {organisation.mission}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Core Values</h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {organisation.values.map((value, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3 dark:border-gray-700">
                                        <span className="text-2xl" aria-hidden="true">{value.icon}</span>
                                        <div>
                                            <h5 className="font-semibold text-gray-900 dark:text-white">{value.title}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Condensed mode view
    if (condensed) {
        return (
            <div className="space-y-4">
                {/* Compact header with quick stats */}
                <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-4 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {organisation.name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{organisation.type}</p>
                        </div>
                        <div className="text-right text-sm">
                            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {organisation.planPeriod}
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        <strong>Vision:</strong> {organisation.vision}
                    </p>
                </div>

                {/* Category buttons */}
                <div className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${expandedSection === section.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            aria-expanded={expandedSection === section.id}
                        >
                            <span aria-hidden="true">{section.icon}</span>
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* Expanded section content */}
                {expandedSection && (
                    <div className="rounded-xl border border-primary/20 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                <span aria-hidden="true">{sections.find(s => s.id === expandedSection)?.icon}</span>
                                {sections.find(s => s.id === expandedSection)?.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setExpandedSection(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                aria-label="Close section"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Render the appropriate section content */}
                        {expandedSection === "overview" && renderSectionContent("overview")}
                        {expandedSection === "constitution" && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Our constitution contains {Object.keys(constitution.clauses).length} clauses organised into {constitution.parts.length} parts.
                                </p>
                                {constitution.parts.slice(0, 2).map((part) => (
                                    <div key={part.id}>
                                        <h4 className="mb-2 font-bold text-gray-900 dark:text-white">{part.title}</h4>
                                        {part.clauses.slice(0, 3).map((clauseNum) => {
                                            const clause = constitution.clauses[clauseNum];
                                            return clause ? (
                                                <p key={clauseNum} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                    <strong>{clause.title}:</strong> {clause.plain}
                                                </p>
                                            ) : null;
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                        {expandedSection === "strategy" && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {strategicPlan.pillars.map((pillar) => (
                                    <div key={pillar.id} className="rounded-lg border p-3 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl" aria-hidden="true">{pillar.icon}</span>
                                            <h5 className="font-bold text-gray-900 dark:text-white text-sm">{pillar.title}</h5>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{pillar.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {expandedSection === "safeguarding" && (
                            <div className="space-y-3">
                                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                    <h4 className="font-bold text-red-800 dark:text-red-200 text-sm">{safeguarding.headline}</h4>
                                    <p className="mt-1 text-xs text-red-700 dark:text-red-300">{safeguarding.statusNote}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{safeguarding.realityCheck}</p>
                            </div>
                        )}
                        {expandedSection === "involved" && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {getInvolved.slice(0, 4).map((opp, i) => (
                                    <div key={i} className="rounded-lg border p-3 dark:border-gray-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{opp.title}</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{opp.shortDesc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {expandedSection === "operations" && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Primary Focus:</strong> {operationalFramework.geographicalFirewall.primaryFocus}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Major Towns:</strong> {operationalFramework.geographicalFirewall.majorTowns.join(", ")}
                                </p>
                            </div>
                        )}
                        {expandedSection === "risks" && (
                            <div className="text-sm">
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {strategicPlan.risks.length} identified risks being actively managed.
                                </p>
                                {strategicPlan.risks.slice(0, 3).map((risk) => (
                                    <p key={risk.id} className="mb-1 text-gray-600 dark:text-gray-400">
                                        • <strong>{risk.name}</strong> (Impact: {risk.impact}/5)
                                    </p>
                                ))}
                            </div>
                        )}
                        {expandedSection === "board-roles" && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {strategicPlan.boardRoles.map((role) => (
                                    <div key={role.id} className="rounded-lg border p-3 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl" aria-hidden="true">{role.icon}</span>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{role.title}</h4>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">{role.timeCommitment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Full mode view (original implementation)
    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Information Hub
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Governance, strategy, and organisational information
                </p>
            </div>

            {/* Overview Section */}
            <Section id="overview" title="Organisation Overview" icon="🏠" defaultOpen={true}>
                <div className="space-y-6">
                    <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <h3 className="text-xl font-bold text-primary dark:text-white">{organisation.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{organisation.type}</p>
                        <div className="mt-4 space-y-2">
                            <p><strong>Vision:</strong> {organisation.vision}</p>
                            <p><strong>Mission:</strong> {organisation.mission}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Core Values</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {organisation.values.map((value, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-lg border p-3 dark:border-gray-700">
                                    <span className="text-2xl" aria-hidden="true">{value.icon}</span>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-white">{value.title}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Constitution Section */}
            <Section id="constitution" title="Full Constitution" icon="⚖️">
                <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our constitution contains {Object.keys(constitution.clauses).length} clauses organised into {constitution.parts.length} parts.
                        Click &quot;Plain English&quot; to see simplified explanations.
                    </p>
                    {constitution.parts.map((part) => (
                        <div key={part.id}>
                            <h4 className="mb-3 border-b pb-2 font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                                {part.title}
                            </h4>
                            <div className="space-y-1">
                                {part.clauses.map((clauseNum) => {
                                    const clause = constitution.clauses[clauseNum];
                                    return clause ? (
                                        <ConstitutionClause
                                            key={clauseNum}
                                            number={clauseNum}
                                            title={clause.title}
                                            content={clause.content}
                                            plain={clause.plain}
                                        />
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Strategic Direction Section */}
            <Section id="strategy" title="Strategic Direction" icon="🗺️">
                <div className="space-y-6">
                    <div>
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Strategic Pillars</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {strategicPlan.pillars.map((pillar) => (
                                <div key={pillar.id} className="rounded-lg border p-4 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl" aria-hidden="true">{pillar.icon}</span>
                                        <div>
                                            <h5 className="font-bold text-gray-900 dark:text-white">{pillar.title}</h5>
                                            <span className="text-xs text-gray-500">{pillar.subtitle}</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{pillar.description}</p>
                                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillar.status === "in-progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                                        pillar.status === "planned" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                        }`}>
                                        {pillar.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Timeline</h4>
                        <div className="space-y-3">
                            {strategicPlan.timeline.map((phase) => (
                                <div key={phase.phase} className={`flex items-start gap-3 rounded-lg border p-3 ${phase.status === "current" ? "border-primary bg-primary/5" : "dark:border-gray-700"
                                    }`}>
                                    <span className="text-2xl" aria-hidden="true">{phase.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="font-bold text-gray-900 dark:text-white">Phase {phase.phase}: {phase.name}</h5>
                                            {phase.status === "current" && (
                                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">Current</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">{phase.period}</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Safeguarding Section */}
            <Section id="safeguarding" title="Safeguarding" icon="🛡️">
                <div className="space-y-4">
                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <h4 className="font-bold text-red-800 dark:text-red-200">{safeguarding.headline}</h4>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{safeguarding.statusNote}</p>
                    </div>
                    <div>
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Our Commitments</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {safeguarding.commitments.map((c, i) => (
                                <div key={i} className="rounded-lg border p-3 dark:border-gray-700">
                                    <h5 className="font-semibold text-gray-900 dark:text-white">{c.title}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Reality Check</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{safeguarding.realityCheck}</p>
                    </div>
                </div>
            </Section>

            {/* Get Involved Section */}
            <Section id="involved" title="Get Involved" icon="🙋">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {getInvolved.map((opp, i) => (
                        <div key={i} className="rounded-lg border p-4 dark:border-gray-700">
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 dark:text-white">{opp.title}</h4>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {opp.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{opp.shortDesc}</p>
                            <a
                                href={safeUrl(`mailto:${organisation.founder.email}?subject=${encodeURIComponent(opp.emailSubject)}`)}
                                className="mt-3 inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                            >
                                {opp.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Operations Section */}
            <Section id="operations" title="Operations" icon="⚙️">
                <div className="space-y-4">
                    <div>
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Focus Area</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Primary Focus:</strong> {operationalFramework.geographicalFirewall.primaryFocus}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <strong>Major Towns:</strong> {operationalFramework.geographicalFirewall.majorTowns.join(", ")}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                            {operationalFramework.geographicalFirewall.context}
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">{operationalFramework.founderCapacity.rule}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{operationalFramework.founderCapacity.description}</p>
                        <div className="mt-2 flex gap-2">
                            {operationalFramework.founderCapacity.trafficLights.map((light, i) => (
                                <div key={i} className={`flex-1 rounded-lg p-2 text-center text-xs ${light.color === "Green" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                                    light.color === "Yellow" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    }`}>
                                    <div className="font-bold">{light.range}</div>
                                    <div className="mt-1 text-[10px]">{light.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Risk Register Section */}
            <Section id="risks" title="Risk Register" icon="⚠️">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Strategic Plan Risk Register">
                        <caption className="sr-only">Strategic Plan Risk Register showing risks, categories, impact, likelihood, and mitigations</caption>
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-2 text-left font-semibold text-gray-900 dark:text-white">Risk</th>
                                <th className="py-2 text-left font-semibold text-gray-900 dark:text-white">Category</th>
                                <th className="py-2 text-center font-semibold text-gray-900 dark:text-white">Impact</th>
                                <th className="py-2 text-center font-semibold text-gray-900 dark:text-white">Likelihood</th>
                                <th className="py-2 text-left font-semibold text-gray-900 dark:text-white">Mitigation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strategicPlan.risks.map((risk) => (
                                <tr key={risk.id} className="border-b dark:border-gray-700">
                                    <td className="py-2 font-medium text-gray-900 dark:text-white">{risk.name}</td>
                                    <td className="py-2 text-gray-600 dark:text-gray-400">{risk.cat}</td>
                                    <td className="py-2 text-center">{risk.impact}/5</td>
                                    <td className="py-2 text-center">{risk.likelihood}/5</td>
                                    <td className="py-2 text-gray-600 dark:text-gray-400">{risk.mitigation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Board Roles Section */}
            <Section id="board-roles" title="Board Roles" icon="👔">
                <div className="space-y-4">
                    {strategicPlan.boardRoles.map((role) => (
                        <div key={role.id} className="rounded-lg border p-4 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl" aria-hidden="true">{role.icon}</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{role.title}</h4>
                                    <span className="text-xs text-gray-500">{role.timeCommitment}</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{role.purpose}</p>
                            <div className="mt-3">
                                <h5 className="text-xs font-semibold uppercase text-gray-500">Responsibilities</h5>
                                <ul className="mt-1 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
                                    {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 italic">This is NOT: {role.isNot}</p>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}

