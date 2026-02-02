"use client";

import { useState } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FlowBuilder, FlowNode, FlowConnection } from "./workflow/flow-builder";
import { COSModal } from "../ui/cos-modal";
import { cn } from "@/lib/utils";

interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger: string;
    action: string;
    isActive: boolean;
    lastRun?: string;
    nodes?: FlowNode[];
    connections?: FlowConnection[];
}

// Sub-component: Workflow List Card
const WorkflowCard = ({
    workflow,
    onEdit,
    onToggle,
    onDelete
}: {
    workflow: Workflow,
    onEdit: (w: Workflow) => void,
    onToggle: (w: Workflow) => void,
    onDelete: (id: string, name: string) => void
}) => (
    <Card
        className={cn(
            "cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            workflow.isActive ? 'border-l-4 border-l-yellow-500 hover:shadow-md' : 'opacity-60 hover:opacity-100'
        )}
        onClick={() => onEdit(workflow)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdit(workflow);
            }
        }}
    >
        <CardHeader className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full ${workflow.isActive ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Zap className="h-5 w-5" />
                </div>
                <Switch
                    checked={workflow.isActive}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(workflow);
                    }}
                    onCheckedChange={() => { }} // Handled by onClick for easier event control
                    aria-label={`Toggle status for ${workflow.name}`}
                />
            </div>

            <div>
                <CardTitle className="text-base truncate mb-1" title={workflow.name}>{workflow.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 min-h-[2.5em]">
                    When <span className="font-semibold text-primary">{workflow.trigger}</span>, then {workflow.action}
                </CardDescription>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>{workflow.nodes?.length || 0} steps</span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(workflow.id, workflow.name);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Workflow"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </CardHeader>
    </Card>
);

// Sub-component: Workflow Editor View
const WorkflowEditor = ({
    workflow,
    title,
    setTitle,
    onBack,
    onSave
}: {
    workflow: Workflow,
    title: string,
    setTitle: (t: string) => void,
    onBack: () => void,
    onSave: (nodes: FlowNode[], connections: FlowConnection[]) => void
}) => (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col max-w-full">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-muted rounded-full"
                    title="Back to Workflows"
                    aria-label="Back to Workflows"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                    placeholder="Workflow Name"
                />
            </div>
        </div>

        <div className="flex-1 min-h-0">
            <FlowBuilder
                initialNodes={workflow.nodes || []}
                initialConnections={workflow.connections || []}
                onSave={onSave}
                className="h-full shadow-inner"
            />
        </div>

        <div className="flex justify-end pt-2 gap-2">
            <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={() => {
                    // Logic to trigger FlowBuilder save would go here
                    // As we don't have a ref, we rely on the builder auto-notifying
                    onBack();
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                Save & Close
            </button>
        </div>
    </div>
);

export function WorkflowApp() {
    const { tenant, isLoading } = useTenant();
    const [workflowError, setWorkflowError] = useState<string | null>(null);

    const { documents: workflows, upsertDocument, deleteDocument, isOnline, error: syncError } =
        useDittoSync<Workflow>({
            collection: "automation_workflows",
            tenantId: tenant?.id || ""
        });

    const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
    const [editorTitle, setEditorTitle] = useState("");
    const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string, name: string } | null>(null);

    const sanitiseText = (value: string, max = 120) =>
        value.replace(/[^\w\s.,-]/g, "").trim().slice(0, max);

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse max-w-full">
                <div className="h-8 w-64 bg-gray-200 rounded" />
                <div className="h-40 bg-gray-100 rounded" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50 max-w-full">
                <p>Unable to load Workflow Automation - Organisation context not available.</p>
            </div>
        );
    }

    const handleCreate = async () => {
        const id = crypto.randomUUID();
        await upsertDocument(id, {
            id,
            name: "New Workflow",
            description: "Draft workflow",
            trigger: "Manual",
            action: "None",
            isActive: false,
            nodes: [],
            connections: []
        });
        setEditingWorkflowId(id);
        setEditorTitle("New Workflow");
    };

    const handleSaveFlow = async (nodes: FlowNode[], connections: FlowConnection[]) => {
        if (!editingWorkflowId) return;

        const workflow = workflows.find(w => w.id === editingWorkflowId);
        if (workflow) {
            // Infer trigger/action from nodes for the simplistic view
            const triggerNode = nodes.find(n => n.type === 'trigger');
            const actionNode = nodes.find(n => n.type === 'action');

            await upsertDocument(editingWorkflowId as any, {
                ...workflow,
                name: editorTitle,
                nodes,
                connections,
                trigger: triggerNode ? triggerNode.title : "Manual",
                action: actionNode ? actionNode.title : "None"
            });
            setEditingWorkflowId(null);
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
            console.error(`[WorkflowApp] Failed to toggle workflow status for "${workflow.name}" (${workflow.id}):`, err);
            setWorkflowError("Failed to update workflow status.");
        }
    };

    const handleDelete = async () => {
        if (!workflowToDelete) return;
        try {
            await deleteDocument(workflowToDelete.id as any);
            setWorkflowToDelete(null);
            setWorkflowError(null);
        } catch (err) {
            console.error(`[WorkflowApp] Failed to delete workflow "${workflowToDelete.name}" (${workflowToDelete.id}):`, err);
            setWorkflowError("Failed to delete the workflow.");
        }
    };

    const activeWorkflow = workflows.find(w => w.id === editingWorkflowId);

    if (editingWorkflowId && activeWorkflow) {
        return (
            <WorkflowEditor
                workflow={activeWorkflow}
                title={editorTitle}
                setTitle={setEditorTitle}
                onBack={() => setEditingWorkflowId(null)}
                onSave={handleSaveFlow}
            />
        );
    }

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
                        <span className="text-xs text-gray-500 hidden sm:inline">{isOnline ? "Synced" : "Offline"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 flex items-center gap-2"
                        aria-label="Create a new workflow automation"
                    >
                        <Plus className="h-4 w-4" />
                        New Workflow
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                        <p>No workflows defined yet. Click "New Workflow" to get started.</p>
                    </div>
                ) : (
                    workflows.map(workflow => (
                        <WorkflowCard
                            key={workflow.id}
                            workflow={workflow}
                            onEdit={(w) => {
                                setEditingWorkflowId(w.id);
                                setEditorTitle(w.name);
                            }}
                            onToggle={toggleWorkflow}
                            onDelete={(id, name) => setWorkflowToDelete({ id, name })}
                        />
                    ))
                )}
            </div>

            {/* Deletion Confirmation Modal */}
            <COSModal
                isOpen={!!workflowToDelete}
                onClose={() => setWorkflowToDelete(null)}
                title="Delete Workflow"
                description={`Are you sure you want to delete "${workflowToDelete?.name}"?`}
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setWorkflowToDelete(null)}
                            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <p className="py-4 text-sm text-muted-foreground">
                    This action cannot be undone. All automation steps and historical run data for this workflow will be permanently removed.
                </p>
            </COSModal>

            {workflowError && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <p className="text-sm font-medium">{workflowError}</p>
                    <button onClick={() => setWorkflowError(null)} className="text-red-900 hover:text-red-700">✕</button>
                </div>
            )}
        </div>
    );
}