"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, Settings, Mail, Bell, MessageSquare, ArrowRight, Plus, X, GripVertical } from "lucide-react";

export interface FlowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition';
    title: string;
    description?: string;
    icon?: React.ReactNode;
    x: number;
    y: number;
    data?: any;
}

export interface FlowConnection {
    id: string;
    source: string;
    target: string;
}

interface FlowBuilderProps {
    initialNodes?: FlowNode[];
    initialConnections?: FlowConnection[];
    onSave?: (nodes: FlowNode[], connections: FlowConnection[]) => void;
    className?: string;
}

// Sub-component: Sidebar
const FlowSidebar = ({ onAdd }: { onAdd: (type: FlowNode['type']) => void }) => (
    <div className="w-64 border-r bg-card p-4 flex flex-col gap-4">
        <h3 className="font-semibold text-sm">Toolbox</h3>
        <div className="space-y-2">
            {[
                { type: 'trigger' as const, label: 'Add Trigger', icon: <Play className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
                { type: 'action' as const, label: 'Add Action', icon: <Settings className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' },
                { type: 'condition' as const, label: 'Add Condition', icon: <ArrowRight className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' }
            ].map(tool => (
                <button
                    key={tool.type}
                    onClick={() => onAdd(tool.type)}
                    className="w-full flex items-center gap-2 p-3 rounded border bg-background hover:bg-muted transition-colors text-sm font-medium"
                >
                    <div className={cn("p-1.5 rounded", tool.color)}>
                        {tool.icon}
                    </div>
                    {tool.label}
                </button>
            ))}
        </div>
        <div className="mt-auto">
            <div className="text-xs text-muted-foreground mb-4">
                Drag nodes to rearrange. Click to edit.
            </div>
        </div>
    </div>
);

// Sub-component: Flow Node
const FlowNodeComponent = ({
    node,
    isSelected,
    onSelect,
    onDelete,
    onDragStart
}: {
    node: FlowNode,
    isSelected: boolean,
    onSelect: () => void,
    onDelete: () => void,
    onDragStart: (e: React.MouseEvent) => void
}) => (
    <div
        className={cn(
            "absolute w-[200px] bg-card border rounded-lg shadow-sm transition-shadow group select-none",
            isSelected && "ring-2 ring-primary",
            node.type === 'trigger' && "border-l-4 border-l-blue-500",
            node.type === 'action' && "border-l-4 border-l-orange-500",
            node.type === 'condition' && "border-l-4 border-l-purple-500"
        )}
        style={{ transform: `translate(${node.x}px, ${node.y}px)` } as React.CSSProperties}
        onMouseDown={onDragStart}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
        <div className="p-3 flex items-start gap-3">
            <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground">
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{node.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{node.type}</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                title="Delete Node"
                aria-label="Delete Node"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
        <div className="absolute top-1/2 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary transform -translate-y-1/2" />
        <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary transform -translate-y-1/2" />
    </div>
);

// Sub-component: Properties Panel
const PropertiesPanel = ({
    node,
    onUpdate,
    onClose
}: {
    node: FlowNode,
    onUpdate: (data: Partial<FlowNode>) => void,
    onClose: () => void
}) => (
    <div className="w-72 border-l bg-card p-4 animate-in slide-in-from-right-10 duration-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Node Properties</h3>
            <button onClick={onClose} title="Close Properties" aria-label="Close Properties">
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
        <div className="space-y-4">
            <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                    type="text"
                    title="Node Title"
                    placeholder="Enter node title"
                    value={node.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded bg-background"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <div className="mt-1 px-3 py-2 text-sm border rounded bg-muted text-muted-foreground capitalize">
                    {node.type}
                </div>
            </div>
        </div>
    </div>
);

export function FlowBuilder({ initialNodes = [], initialConnections = [], onSave, className }: FlowBuilderProps) {
    const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
    const [connections, setConnections] = useState<FlowConnection[]>(initialConnections);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-save changes
    useEffect(() => {
        onSave?.(nodes, connections);
    }, [nodes, connections, onSave]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(20, Math.min(rect.width - 220, e.clientX - rect.left - 100));
            const y = Math.max(20, Math.min(rect.height - 100, e.clientY - rect.top - 40));

            setNodes(prev => prev.map(n =>
                n.id === isDragging ? { ...n, x, y } : n
            ));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    const addNode = (type: FlowNode['type']) => {
        const id = crypto.randomUUID();
        const newNode: FlowNode = {
            id,
            type,
            title: type === 'trigger' ? 'New Trigger' : 'New Action',
            x: 50 + (nodes.length * 20),
            y: 50 + (nodes.length * 50),
            icon: type === 'trigger' ? <Play className="w-4 h-4" /> : <Settings className="w-4 h-4" />
        };
        setNodes([...nodes, newNode]);

        if (nodes.length > 0) {
            setConnections([...connections, {
                id: crypto.randomUUID(),
                source: nodes[nodes.length - 1].id,
                target: id
            }]);
        }
    };

    const deleteNode = (id: string) => {
        setNodes(nodes.filter(n => n.id !== id));
        setConnections(connections.filter(c => c.source !== id && c.target !== id));
        if (selectedNode === id) setSelectedNode(null);
    };

    return (
        <div className={cn("flex h-full border rounded-lg bg-gray-50 dark:bg-gray-900/50", className)}>
            <FlowSidebar onAdd={addNode} />

            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden bg-dot-pattern cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    {connections.map(conn => {
                        const source = nodes.find(n => n.id === conn.source);
                        const target = nodes.find(n => n.id === conn.target);
                        if (!source || !target) return null;

                        const startX = source.x + 200;
                        const startY = source.y + 40;
                        const endX = target.x;
                        const endY = target.y + 40;

                        return (
                            <g key={conn.id}>
                                <path
                                    d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                                    fill="none"
                                    stroke="currentColor"
                                    className="text-gray-300 dark:text-gray-700"
                                    strokeWidth="2"
                                />
                                <circle cx={endX} cy={endY} r="3" className="fill-gray-400" />
                            </g>
                        );
                    })}
                </svg>

                {nodes.map(node => (
                    <FlowNodeComponent
                        key={node.id}
                        node={node}
                        isSelected={selectedNode === node.id}
                        onSelect={() => setSelectedNode(node.id)}
                        onDelete={() => deleteNode(node.id)}
                        onDragStart={(e) => { e.stopPropagation(); setIsDragging(node.id); }}
                    />
                ))}
            </div>

            {selectedNode && (
                <PropertiesPanel
                    node={nodes.find(n => n.id === selectedNode)!}
                    onUpdate={(data) => setNodes(nodes.map(n => n.id === selectedNode ? { ...n, ...data } : n))}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
}
