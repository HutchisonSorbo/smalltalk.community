"use client";

import * as React from "react";
import { useTenant } from "@/components/communityos/TenantProvider";
import {
    getPipelines,
    getPipelineStages,
    getContacts,
    getDeals,
    createDeal,
    createContact,
    createPipeline,
} from "@/lib/communityos/crm-actions";
import { CRMPipelineBoard } from "../crm/crm-pipeline-board";
import { CRMDealDetailSheet } from "../crm/crm-deal-detail-sheet";
import { CRMSwipeableContactCard } from "../crm/crm-swipeable-contact-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Users, BarChart3, Loader2, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { COSEmptyState } from "../ui/cos-empty-state";
import { CRMSearchBar } from "../crm/crm-search-bar";
import { CRMActivityTimeline } from "../crm/crm-activity-timeline";
import { CRMBulkActions } from "../crm/crm-bulk-actions";
import { CRMImportExport } from "../crm/crm-import-export";
import { getActivityLog, bulkCreateContacts } from "@/lib/communityos/crm-actions";

export function CRMProApp() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const [pipelines, setPipelines] = React.useState<any[]>([]);
    const [selectedPipelineId, setSelectedPipelineId] = React.useState<string | null>(null);
    const [stages, setStages] = React.useState<any[]>([]);
    const [deals, setDeals] = React.useState<any[]>([]);
    const [contacts, setContacts] = React.useState<any[]>([]);
    const [activityLogs, setActivityLogs] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isActivityLoading, setIsActivityLoading] = React.useState(false);

    // Selection State
    const [selectedContactIds, setSelectedContactIds] = React.useState<string[]>([]);

    // UI State
    const [activeDeal, setActiveDeal] = React.useState<any | null>(null);
    const [isDealSheetOpen, setIsDealSheetOpen] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        if (!tenant?.id) return;
        setIsLoading(true);
        try {
            const [pipelinesRes, contactsRes] = await Promise.all([
                getPipelines(tenant.id),
                getContacts(tenant.id)
            ]);

            if (pipelinesRes.success) {
                setPipelines(pipelinesRes.data);
                if (pipelinesRes.data.length > 0 && !selectedPipelineId) {
                    setSelectedPipelineId(pipelinesRes.data[0].id);
                }
            }
            if (contactsRes.success) {
                setContacts(contactsRes.data);
            }
        } catch (err) {
            toast.error("Failed to load CRM data");
        } finally {
            setIsLoading(false);
        }
    }, [tenant?.id, selectedPipelineId]);

    const fetchActivity = React.useCallback(async () => {
        if (!tenant?.id) return;
        setIsActivityLoading(true);
        const res = await getActivityLog(tenant.id);
        if (res.success) setActivityLogs(res.data);
        setIsActivityLoading(false);
    }, [tenant?.id]);

    const fetchDealsAndStages = React.useCallback(async () => {
        if (!tenant?.id || !selectedPipelineId) return;
        try {
            const [stagesRes, dealsRes] = await Promise.all([
                getPipelineStages(selectedPipelineId),
                getDeals(tenant.id, selectedPipelineId)
            ]);

            if (stagesRes.success) setStages(stagesRes.data);
            if (dealsRes.success) setDeals(dealsRes.data);
        } catch (err) {
            toast.error("Failed to load pipeline data");
        }
    }, [tenant?.id, selectedPipelineId]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    React.useEffect(() => {
        fetchDealsAndStages();
    }, [fetchDealsAndStages]);

    const handleCreatePipeline = async () => {
        if (!tenant?.id) return;
        const name = window.prompt("Enter pipeline name:");
        if (!name) return;

        const res = await createPipeline(tenant.id, { name });
        if (res.success) {
            toast.success("Pipeline created");
            fetchData();
        } else {
            toast.error(res.error);
        }
    };

    const handleToggleContactSelection = (id: string, selected: boolean) => {
        setSelectedContactIds(prev =>
            selected ? [...prev, id] : prev.filter(c => c !== id)
        );
    };

    const handleBulkAction = async (action: string) => {
        toast.info(`Bulk ${action} for ${selectedContactIds.length} items (Coming Soon)`);
        // Implementation for bulk actions would go here
        if (action === "delete") {
            // Confirm and perform delete
        }
    };

    const handleContactsImport = async (importedContacts: { firstName: string; lastName: string; email: string; phone: string }[]) => {
        if (!tenant?.id) return;
        const result = await bulkCreateContacts(tenant.id, importedContacts);
        if (result.success) {
            await fetchData();
        } else {
            throw new Error(result.error);
        }
    };

    const handleSaveDeal = async (dealData: any) => {
        if (!tenant?.id) return;

        // If it has an ID, we should update (not implemented updateDeal yet, but for now we follow the pattern)
        // For simplicity in this demo implementation, let's assume create
        const res = await createDeal(tenant.id, dealData);
        if (res.success) {
            toast.success("Deal saved");
            fetchDealsAndStages();
        } else {
            toast.error(res.error);
        }
    };

    if (isTenantLoading || (isLoading && pipelines.length === 0)) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <COSEmptyState
                title="Organisation Required"
                description="Please select an organisation to access the CRM."
                icon={<BarChart3 />}
            />
        );
    }

    if (pipelines.length === 0) {
        return (
            <COSEmptyState
                title="No Pipelines Found"
                description="Create your first sales or outreach pipeline to start tracking deals."
                icon={<BarChart3 />}
                action={{
                    label: "Create Pipeline",
                    onClick: handleCreatePipeline
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CRM Pro</h2>
                    <p className="text-muted-foreground font-medium">
                        Advanced deal tracking and contact management for {tenant.name}.
                    </p>
                </div>
                <div className="flex flex-1 items-center gap-3 justify-end">
                    <CRMSearchBar
                        onResultSelect={(type, id) => {
                            if (type === "deal") {
                                // Find deal and open it
                                const deal = deals.find(d => d.id === id);
                                if (deal) {
                                    setActiveDeal(deal);
                                    setIsDealSheetOpen(true);
                                } else {
                                    toast.info("Opening deal detail...");
                                }
                            } else {
                                toast.info(`Contact view coming soon (ID: ${id})`);
                            }
                        }}
                    />
                    <Button variant="outline" size="icon" title="Pipeline Settings">
                        <Settings className="h-4 w-4" />
                    </Button>
                    <CRMImportExport contacts={contacts} onImport={handleContactsImport} />
                    <Button onClick={() => {
                        setActiveDeal({ pipelineStageId: stages[0]?.id });
                        setIsDealSheetOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deal
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pipeline" className="w-full">
                <div className="flex items-center justify-between border-b pb-4">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="pipeline" className="data-[state=active]:bg-background">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Pipeline
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="data-[state=active]:bg-background">
                            <Users className="mr-2 h-4 w-4" />
                            Contacts
                        </TabsTrigger>
                        <TabsTrigger
                            value="activity"
                            className="data-[state=active]:bg-background"
                            onClick={fetchActivity}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    {selectedPipelineId && (
                        <select
                            className="bg-transparent text-sm font-bold border-none focus:ring-0 cursor-pointer hover:text-primary transition-colors"
                            value={selectedPipelineId}
                            onChange={(e) => setSelectedPipelineId(e.target.value)}
                            title="Select Pipeline"
                            aria-label="Select Pipeline"
                        >
                            {pipelines.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <TabsContent value="pipeline" className="pt-6">
                    <CRMPipelineBoard
                        organisationId={tenant.id}
                        stages={stages}
                        initialDeals={deals}
                        onDealClick={(deal) => {
                            setActiveDeal(deal);
                            setIsDealSheetOpen(true);
                        }}
                        onAddDeal={(stageId) => {
                            setActiveDeal({ pipelineStageId: stageId });
                            setIsDealSheetOpen(true);
                        }}
                    />
                </TabsContent>

                <TabsContent value="contacts" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {contacts.map((contact) => (
                            <CRMSwipeableContactCard
                                key={contact.id}
                                contact={contact}
                                isSelected={selectedContactIds.includes(contact.id)}
                                onToggleSelection={handleToggleContactSelection}
                                onClick={() => {
                                    // Handle contact click if needed
                                    toast.info(`Clicked contact: ${contact.firstName}`);
                                }}
                            />
                        ))}
                        {contacts.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-muted/30">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                    No Contacts Found
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                    <CRMActivityTimeline logs={activityLogs} isLoading={isActivityLoading} />
                </TabsContent>
            </Tabs>

            <CRMDealDetailSheet
                deal={activeDeal}
                stages={stages}
                isOpen={isDealSheetOpen}
                onClose={() => setIsDealSheetOpen(false)}
                onSave={handleSaveDeal}
            />

            <CRMBulkActions
                selectedCount={selectedContactIds.length}
                onClear={() => setSelectedContactIds([])}
                onAction={handleBulkAction}
            />
        </div>
    );
}
