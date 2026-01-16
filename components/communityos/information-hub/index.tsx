"use client";

/**
 * Information Hub Component
 * Central governance and strategic information hub with expandable sections
 */

import { useState } from "react";
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
    tenantCode: string;
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
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`section-${id}`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </span>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
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

export function InformationHub({ tenantCode }: InformationHubProps) {
    const data = getTenantData(tenantCode);
    const { organisation, constitution, strategicPlan, safeguarding, getInvolved, operationalFramework } = data;

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
                                    <span className="text-2xl">{value.icon}</span>
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
                        Click "Plain English" to see simplified explanations.
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
                                        <span className="text-2xl">{pillar.icon}</span>
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
                                    <span className="text-2xl">{phase.icon}</span>
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
                                href={`mailto:${organisation.founder.email}?subject=${encodeURIComponent(opp.emailSubject)}`}
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
                    <table className="w-full text-sm">
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
                                <span className="text-2xl">{role.icon}</span>
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
