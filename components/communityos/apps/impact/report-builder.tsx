"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DraggableAttributes as Attributes,
    DraggableSyntheticListeners as Listeners
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

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;

interface SortableSectionProps {
    section: ReportSection;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void;
}

interface ChartOptions {
    stacked?: boolean;
    showLegend?: boolean;
    colors?: string[];
    xKey?: string;
    yKeys?: string[];
    labels?: string[];
}

type KpiGridContent = string[];
type ChartContent = { chartType: 'bar' | 'line' | 'pie'; kpiIds: string[]; options?: ChartOptions };
export type TableContent<T extends Record<string, unknown> = Record<string, unknown>> = {
    columns: { key: keyof T & string; label: string }[];
    rows: T[]
};
type ReportSectionContent = string | KpiGridContent | ChartContent | TableContent;

interface ReportBuilderProps {
    initialSections?: ReportSection[];
    onSave?: (sections: ReportSection[]) => void;
}

function HeaderControls({
    section,
    onRemove,
    attributes,
    listeners
}: {
    section: ReportSection;
    onRemove: (id: string) => void;
    attributes: Attributes;
    listeners: Listeners;
}) {
    return (
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
            </div>
        </CardHeader>
    );
}

function TextSectionEditor({
    section,
    onUpdate
}: {
    section: ReportSection;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void
}) {
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.slice(0, MAX_CONTENT_LENGTH);
        onUpdate(section.id, { content: value });
    };

    return (
        <div className="space-y-1">
            <Textarea
                value={section.content as string || ""}
                onChange={handleContentChange}
                placeholder="Enter section content..."
                className="min-h-[100px]"
                aria-label="Section content"
            />
            <div className="text-[10px] text-muted-foreground text-right">
                {(section.content as string)?.length || 0}/{MAX_CONTENT_LENGTH}
            </div>
        </div>
    );
}

function HeaderSectionEditor({
    section,
    onUpdate
}: {
    section: ReportSection;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void
}) {
    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, MAX_CONTENT_LENGTH);
        onUpdate(section.id, { content: value });
    };

    return (
        <Input
            value={section.content as string || ""}
            onChange={handleContentChange}
            placeholder="Subtitle or description"
            aria-label="Header content"
        />
    );
}

function ConfigPlaceholder({ label }: { label: string }) {
    return (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-secondary/20">
            {label}
        </div>
    );
}

function ContentEditor({
    section,
    onUpdate
}: {
    section: ReportSection;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void
}) {
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, MAX_TITLE_LENGTH);
        onUpdate(section.id, { title: value });
    };

    return (
        <CardContent className="pl-12 space-y-4">
            <div className="space-y-1">
                <Input
                    value={section.title || ""}
                    onChange={handleTitleChange}
                    placeholder="Section Title"
                    className="font-semibold"
                    aria-label="Section title"
                />
                <div className="text-[10px] text-muted-foreground text-right">
                    {section.title?.length || 0}/{MAX_TITLE_LENGTH}
                </div>
            </div>

            {section.type === 'text' && <TextSectionEditor section={section} onUpdate={onUpdate} />}
            {section.type === 'header' && <HeaderSectionEditor section={section} onUpdate={onUpdate} />}
            {(section.type === 'chart' || section.type === 'kpi-grid') && (
                <ConfigPlaceholder label="Configuration Placeholder (Integrated with builder data)" />
            )}
            {section.type === 'table' && <ConfigPlaceholder label="Table configuration coming soon" />}
        </CardContent>
    );
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

    return (
        <div ref={setNodeRef} style={style} className="group relative mb-4">
            <Card>
                <HeaderControls
                    section={section}
                    onRemove={onRemove}
                    attributes={attributes}
                    listeners={listeners}
                />
                <ContentEditor section={section} onUpdate={onUpdate} />
            </Card>
        </div>
    );
}

function ReportPreview({ sections, onBack }: { sections: ReportSection[]; onBack: () => void }) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto p-8 bg-white dark:bg-gray-950 min-h-screen border shadow-sm my-8 rounded-lg print:border-none print:shadow-none">
            <div className="flex justify-between items-center print:hidden border-b pb-4 mb-6">
                <h2 className="text-xl font-bold">Report Preview</h2>
                <Button variant="secondary" onClick={onBack} icon={<Eye className="h-4 w-4" />}>
                    Edit Mode
                </Button>
            </div>
            {sections.map(section => (
                <div key={section.id} className="mb-8">
                    {section.title && <h3 className="text-2xl font-bold mb-4 truncate">{section.title}</h3>}
                    <div className="prose dark:prose-invert max-w-none">
                        {section.type === 'text' && <p className="whitespace-pre-wrap line-clamp-3 break-words">{section.content as string}</p>}
                        {section.type === 'header' && <p className="text-xl text-muted-foreground truncate">{section.content as string}</p>}
                        {(section.type === 'chart' || section.type === 'kpi-grid' || section.type === 'table') && (
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

interface ReportHeaderProps {
    onPreview: () => void;
    onSave: () => void;
}

function ReportHeader({ onPreview, onSave }: ReportHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Report Builder</h2>
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={onPreview}
                    icon={<Eye className="h-4 w-4" />}
                >
                    Preview
                </Button>
                <Button
                    onClick={onSave}
                    variant="primary"
                >
                    Save Report
                </Button>
            </div>
        </div>
    );
}

interface ReportSectionsListProps {
    sections: ReportSection[];
    sensors: any;
    onDragEnd: (event: DragEndEvent) => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ReportSection>) => void;
    onAdd: (type: ReportSectionType) => void;
}

function ReportSectionsList({
    sections,
    sensors,
    onDragEnd,
    onRemove,
    onUpdate,
    onAdd
}: ReportSectionsListProps) {
    return (
        <div className="bg-muted/30 p-4 rounded-lg border min-h-[500px]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sections.map((section) => (
                        <SortableSection
                            key={section.id}
                            section={section}
                            onRemove={onRemove}
                            onUpdate={onUpdate}
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
                        <DropdownMenuItem onClick={() => onAdd('header')}>
                            <Type className="mr-2 h-4 w-4" /> Header
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdd('text')}>
                            <FileText className="mr-2 h-4 w-4" /> Text Block
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdd('kpi-grid')}>
                            <LayoutGrid className="mr-2 h-4 w-4" /> KPI Grid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdd('chart')}>
                            <BarChart3 className="mr-2 h-4 w-4" /> Chart
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdd('table')}>
                            <TableIcon className="mr-2 h-4 w-4" /> Table
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
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
        let content: ReportSectionContent = "";
        if (type === 'kpi-grid') content = [];
        if (type === 'chart') content = { chartType: 'bar' as const, kpiIds: [], options: {} };
        if (type === 'table') content = { columns: [], rows: [] } as TableContent;

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
        return <ReportPreview sections={sections} onBack={() => setPreviewMode(false)} />;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <ReportHeader
                onPreview={() => setPreviewMode(true)}
                onSave={() => onSave?.(sections)}
            />
            <ReportSectionsList
                sections={sections}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                onRemove={removeSection}
                onUpdate={updateSection}
                onAdd={addSection}
            />
        </div>
    );
}
