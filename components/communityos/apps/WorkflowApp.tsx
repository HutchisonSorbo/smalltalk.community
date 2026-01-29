"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Play, Plus, Trash2, Settings2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger: string;
    action: string;
    isActive: boolean;
    lastRun?: string;
}

export function WorkflowApp() {
    const { tenant, isLoading } = useTenant();
    const [workflowError, setWorkflowError] = useState<string | null>(null);

    const { documents: workflows, upsertDocument, deleteDocument, isOnline, error: syncError } =
        useDittoSync<Workflow>({
            collection: "automation_workflows",
            tenantId: tenant?.id || ""
        });

    const [isAdding, setIsAdding] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
        name: "",
        description: "",
        trigger: "Contact Added",
        action: "Send Welcome Email",
        isActive: true
    });

    const sanitizeText = (value: string, max = 120) =>
        value.replace(/[^\w\s.,-]/g, "").trim().slice(0, max);

    if (isLoading) {
        return <div className="p-4 space-y-4 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-40 bg-gray-100 rounded" />
        </div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load Workflow Automation - Organisation context not available.</p>
            </div>
        );
    }

    const handleAdd = async () => {
        const name = sanitizeText(newWorkflow.name ?? "");
        const trigger = sanitizeText(newWorkflow.trigger ?? "");
        const action = sanitizeText(newWorkflow.action ?? "");
        
        if (name && trigger && action) {
            try {
                const workflowId = crypto.randomUUID();
                await upsertDocument(workflowId, {
                    ...newWorkflow,
                    name,
                    trigger,
                    action,
                    id: workflowId,
                    isActive: true
                } as Workflow);
                
                setIsAdding(false);
                setNewWorkflow({
                    name: "",
                    description: "",
                    trigger: "Contact Added",
                    action: "Send Welcome Email",
                    isActive: true
                });
                setWorkflowError(null);
            } catch (err) {
                setWorkflowError("Failed to save the workflow. Please try again.");
            }
        } else {
            setWorkflowError("Please ensure the workflow name, trigger and action are correctly filled.");
        }
    };

    const toggleWorkflow = async (workflow: Workflow) => {
        try {
            await upsertDocument(workflow.id, {
                ...workflow,
                isActive: !workflow.isActive
            });
            setWorkflowError(null);
        } catch (err) {
            setWorkflowError("Failed to update workflow status.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
            setWorkflowError(null);
        } catch (err) {
            setWorkflowError("Failed to delete the workflow.");
        }
    };

    return (
        <div className="space-y-6 max-w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Workflow Automation
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Automate repetitive tasks with custom triggers and actions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500">{isOnline ? "Online Syncing" : "Offline Mode"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 flex items-center gap-2"
                        aria-label="Add a new workflow automation"
                    >
                        <Plus className="h-4 w-4" />
                        New Workflow
                    </button>
                </div>
            </div>

            {(workflowError || syncError) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    <p>{workflowError || "A synchronisation error occurred."}</p>
                </div>
            )}

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Create New Workflow</CardTitle>
                        <CardDescription>Define a trigger and an automated action.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="workflow-name" className="text-sm font-medium">Workflow Name</label>
                                <input
                                    id="workflow-name"
                                    className="w-full rounded border p-2 text-sm dark:bg-gray-800"
                                    placeholder="e.g., Welcome New Members"
                                    value={newWorkflow.name}
                                    onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="workflow-trigger" className="text-sm font-medium">Trigger</label>
                                <select
                                    id="workflow-trigger"
                                    className="w-full rounded border p-2 text-sm dark:bg-gray-800"
                                    title="Workflow Trigger"
                                    value={newWorkflow.trigger}
                                    onChange={e => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                                >
                                    <option>Contact Added</option>
                                    <option>Badge Awarded</option>
                                    <option>Event Participation</option>
                                    <option>Application Received</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="workflow-action" className="text-sm font-medium">Action</label>
                                <select
                                    id="workflow-action"
                                    className="w-full rounded border p-2 text-sm dark:bg-gray-800"
                                    title="Workflow Action"
                                    value={newWorkflow.action}
                                    onChange={e => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                                >
                                    <option>Send Welcome Email</option>
                                    <option>Notify Admin (Mobile)</option>
                                    <option>Add Segment: Newcomer</option>
                                    <option>Create Record in Records App</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="w-full rounded bg-primary py-2 text-sm text-white"
                                    aria-label="Submit new workflow"
                                >
                                    Create Workflow
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {workflows.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                        <p>No workflows defined yet. Click "New Workflow" to get started.</p>
                    </div>
                ) : (
                    workflows.map(workflow => {
                        const moderatedName = sanitizeText(workflow.name ?? "");
                        const moderatedTrigger = sanitizeText(workflow.trigger ?? "");
                        const moderatedAction = sanitizeText(workflow.action ?? "");
                        
                        return (
                            <Card key={workflow.id} className={workflow.isActive ? 'border-l-4 border-l-yellow-500' : 'opacity-60'}>
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${workflow.isActive ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <CardTitle className="text-base truncate">{moderatedName}</CardTitle>
                                            <CardDescription className="text-xs line-clamp-1">
                                                When <span className="font-semibold text-primary">{moderatedTrigger}</span> → {moderatedAction}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4 hidden sm:block">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status</p>
                                            <p className={`text-xs ${workflow.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {workflow.isActive ? 'Active' : 'Paused'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={workflow.isActive}
                                            onCheckedChange={() => toggleWorkflow(workflow)}
                                            aria-label={`Toggle ${moderatedName}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(workflow.id)}
                                            className="text-gray-400 hover:text-red-500"
                                            title="Delete Workflow"
                                            aria-label={`Delete workflow ${moderatedName}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}