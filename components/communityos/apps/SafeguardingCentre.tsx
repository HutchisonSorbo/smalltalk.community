"use client";

import { useState, useEffect, useCallback } from "react";
import { useTenant } from "@/components/communityos/TenantProvider";
import { useModeration } from "@/hooks/use-moderation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { saveVCSSStatus } from "@/lib/communityos/actions";
import { useToast } from "@/hooks/use-toast";

interface VCSSStandard {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

const INITIAL_STANDARDS: VCSSStandard[] = [
    { id: 1, title: "Standard 1: Culturally Safe Environments", description: "Organisations establish a culturally safe environment in which the diverse and unique identities and experiences of Aboriginal children and young people are respected and valued.", completed: false },
    { id: 2, title: "Standard 2: Leadership, Governance and Culture", description: "Child safety and wellbeing is embedded in organisational leadership, governance and culture.", completed: false },
    { id: 3, title: "Standard 3: Child and Student Empowerment", description: "Children and young people are empowered about their rights, participate in decisions affecting them and are taken seriously.", completed: false },
    { id: 4, title: "Standard 4: Family Engagement", description: "Families and communities are informed and involved in promoting child safety and wellbeing.", completed: false },
    { id: 5, title: "Standard 5: Equity and Diverse Needs", description: "Equity is upheld and diverse needs respected in policy and practice.", completed: false },
    { id: 6, title: "Standard 6: Suitable Staff and Volunteers", description: "People working with children and young people are suitable and supported to reflect child safety and wellbeing values in practice.", completed: false },
    { id: 7, title: "Standard 7: Complaints Processes", description: "Processes for complaints and concerns are child-focused.", completed: false },
    { id: 8, title: "Standard 8: Child Safety Knowledge and Skills", description: "Staff and volunteers are equipped with the knowledge, skills and awareness to keep children and young people safe through ongoing education and training.", completed: false },
    { id: 9, title: "Standard 9: Child Safety in Physical and Online Environments", description: "Physical and online environments promote child safety and wellbeing while minimising the opportunity for children and young people to be harmed.", completed: false },
    { id: 10, title: "Standard 10: Review of Child Safety Practices", description: "Implementation of the Child Safe Standards is regularly reviewed and improved.", completed: false },
    { id: 11, title: "Standard 11: Implementation of Child Safety Policy", description: "Policies and procedures document how the organisation is safe for children and young people.", completed: false },
];

/**
 * Subcomponent: Header section for the Safeguarding Centre
 */
function SafeguardingHeader({ tenantName }: { tenantName: string }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                    Safeguarding Centre
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage Victorian Child Safe Standards (VCSS) compliance for {tenantName}.
                </p>
            </div>
        </div>
    );
}

/**
 * Subcomponent: Compliance Progress Overview
 */
function ComplianceOverview({ progress }: { progress: number }) {
    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Overall Compliance Progress
                    <output className="text-primary font-bold" aria-live="polite">
                        {progress}%
                    </output>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Progress value={progress} className="h-2" aria-label="Overall compliance progress" />
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" aria-hidden="true" />
                    Complete all 11 standards to achieve full compliance certification.
                </p>
            </CardContent>
        </Card>
    );
}

/**
 * Subcomponent: Individual Checklist Item
 */
function VCSSItem({
    standard,
    onToggle
}: {
    standard: VCSSStandard,
    onToggle: (id: number) => void
}) {
    const id = `std-${standard.id}`;
    return (
        <Card className={`transition-colors ${standard.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
            <CardHeader className="p-4 flex flex-row items-start gap-4 space-y-0">
                <Checkbox
                    id={id}
                    checked={standard.completed}
                    onCheckedChange={() => onToggle(standard.id)}
                    className="mt-1"
                />
                <div className="space-y-1">
                    <label
                        htmlFor={id}
                        className="text-sm font-semibold leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {standard.title}
                    </label>
                    <CardDescription className="text-xs">
                        {standard.description}
                    </CardDescription>
                </div>
                {standard.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" aria-hidden="true" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 ml-auto shrink-0" aria-hidden="true" />
                )}
            </CardHeader>
        </Card>
    );
}

export function SafeguardingCentre() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const { moderatedContent: moderatedTenantName, isLoading: isModerationLoading } = useModeration(tenant?.name || "");
    const [standards, setStandards] = useState<VCSSStandard[]>(INITIAL_STANDARDS);
    const { toast } = useToast();

    useEffect(() => {
        if (tenant?.vcssStatus) {
            try {
                const persistedStandards = Array.isArray(tenant.vcssStatus)
                    ? tenant.vcssStatus
                    : typeof tenant.vcssStatus === 'string'
                        ? JSON.parse(tenant.vcssStatus)
                        : [];

                if (persistedStandards.length > 0) {
                    setStandards(persistedStandards);
                }
            } catch (error) {
                console.error("Failed to parse persisted VCSS status:", error);
            }
        }
    }, [tenant]);

    const toggleStandard = useCallback(async (id: number) => {
        const previousStandards = [...standards];
        const updatedStandards = standards.map(s => s.id === id ? { ...s, completed: !s.completed } : s);

        // Optimistic UI update
        setStandards(updatedStandards);

        if (tenant?.id) {
            try {
                const result = await saveVCSSStatus(tenant.id, updatedStandards);
                if (!result.success) {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error("Failed to persist VCSS progress:", error);
                // Rollback on failure
                setStandards(previousStandards);
                toast({
                    title: "Update Failed",
                    description: "Weren't able to save your progress. Please check your connection.",
                    variant: "destructive",
                });
            }
        }
    }, [standards, tenant?.id, toast]);

    if (isTenantLoading || (tenant && isModerationLoading)) {
        return (
            <div className="p-4 space-y-4">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
                <div className="h-32 w-full bg-gray-100 animate-pulse rounded" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load Safeguarding Centre - Organisation context not available.</p>
            </div>
        );
    }

    const completedCount = standards.filter(s => s.completed).length;
    const progress = Math.round((completedCount / standards.length) * 100);

    return (
        <div className="space-y-6 max-w-full">
            <SafeguardingHeader tenantName={moderatedTenantName} />
            <ComplianceOverview progress={progress} />

            <div className="grid gap-4">
                {standards.map((standard) => (
                    <VCSSItem
                        key={standard.id}
                        standard={standard}
                        onToggle={toggleStandard}
                    />
                ))}
            </div>
        </div>
    );
}