"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReportSection, ReportSectionType } from "@/lib/communityos/impact/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COSButton as Button } from "@/components/communityos/ui/cos-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2, Eye, FileText, BarChart3, LayoutGrid, Type, Table as TableIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SortableSectionProps {
    section: ReportSection;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void;
}

function SortableSection({ section, onRemove, onUpdate }: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate(section.id, { content: e.target.value });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(section.id, { title: e.target.value });
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative mb-4">
            <Card>
                <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                    <div {...attributes} {...listeners} className="mr-2 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                                {section.type}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => onRemove(section.id)}
                                aria-label="Remove section"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            value={section.title || ""}
                            onChange={handleTitleChange}
                            placeholder="Section Title"
                            className="font-semibold"
                            aria-label="Section title"
                        />
                    </div>
                </CardHeader>
                <CardContent className="pl-12">
                    {section.type === 'text' && (
                        <Textarea
                            value={section.content || ""}
                            onChange={handleContentChange}
                            placeholder="Enter section content..."
                            className="min-h-[100px]"
                            aria-label="Section content"
                        />
                    )}
                    {section.type === 'header' && (
                        <Input
                            value={section.content || ""}
                            onChange={handleContentChange}
                            placeholder="Subtitle or description"
                            aria-label="Header content"
                        />
                    )}
                    {(section.type === 'chart' || section.type === 'kpi-grid') && (
                        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-secondary/20">
                            {section.content ? `Configured: ${section.content}` : "Click to configure data source (Mock)"}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface ReportBuilderProps {
    initialSections?: ReportSection[];
    onSave?: (sections: ReportSection[]) => void;
}

export function ReportBuilder({ initialSections = [], onSave }: ReportBuilderProps) {
    const [sections, setSections] = useState<ReportSection[]>(initialSections);
    const [previewMode, setPreviewMode] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addSection = (type: ReportSectionType) => {
        let content: any = "";

        if (type === 'kpi-grid') content = [];
        if (type === 'chart') content = { chartType: 'bar', kpiIds: [] };
        if (type === 'table') content = { columns: [], rows: [] };

        const newSection = {
            id: crypto.randomUUID(),
            type,
            order: sections.length,
            title: "",
            content
        } as ReportSection;

        setSections([...sections, newSection]);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, updates: Partial<ReportSection>) => {
        setSections(sections.map(s => {
            if (s.id !== id) return s;
            return { ...s, ...updates } as ReportSection;
        }));
    };

    if (previewMode) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto p-8 bg-white dark:bg-gray-950 min-h-screen border shadow-sm my-8 rounded-lg print:border-none print:shadow-none">
                <div className="flex justify-between items-center print:hidden border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold">Report Preview</h2>
                    <Button variant="secondary" onClick={() => setPreviewMode(false)} icon={<Eye className="h-4 w-4" />}>
                        Edit Mode
                    </Button>
                </div>
                {sections.map(section => (
                    <div key={section.id} className="mb-8">
                        {section.title && <h3 className="text-2xl font-bold mb-4">{section.title}</h3>}
                        <div className="prose dark:prose-invert max-w-none">
                            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
                            {section.type === 'header' && <p className="text-xl text-muted-foreground">{section.content}</p>}
                            {/* Render placeholders for complex types in preview for now */}
                            {(section.type === 'chart' || section.type === 'kpi-grid') && (
                                <div className="bg-secondary/20 border border-dashed rounded h-32 flex items-center justify-center text-muted-foreground">
                                    [Visualization Placeholder: {section.type}]
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Report Builder</h2>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setPreviewMode(true)}
                        icon={<Eye className="h-4 w-4" />}
                    >
                        Preview
                    </Button>
                    <Button
                        onClick={() => onSave?.(sections)}
                        variant="primary"
                    >
                        Save Report
                    </Button>
                </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border min-h-[500px]">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sections.map((section) => (
                            <SortableSection
                                key={section.id}
                                section={section}
                                onRemove={removeSection}
                                onUpdate={updateSection}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg bg-background/50">
                        <FileText className="h-10 w-10 mb-2 opacity-50" />
                        <p>Drag and drop sections here to build your report</p>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" icon={<Plus className="h-4 w-4" />}>
                                Add Section
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                            <DropdownMenuItem onClick={() => addSection('header')}>
                                <Type className="mr-2 h-4 w-4" /> Header
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addSection('text')}>
                                <FileText className="mr-2 h-4 w-4" /> Text Block
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addSection('kpi-grid')}>
                                <LayoutGrid className="mr-2 h-4 w-4" /> KPI Grid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addSection('chart')}>
                                <BarChart3 className="mr-2 h-4 w-4" /> Chart
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addSection('table')}>
                                <TableIcon className="mr-2 h-4 w-4" /> Table
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
