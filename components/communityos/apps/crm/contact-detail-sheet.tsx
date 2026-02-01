"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, Trash2, X, Plus } from "lucide-react";
import { sanitizeDisplay } from "@/lib/utils/moderation";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { safeUrl } from "@/lib/utils";

import { CRMContact, CRMInteraction, CRM_STAGES } from "@/lib/communityos/crm/types";
import { ActivityTimeline } from "./activity-timeline";
import { Label } from "@/components/ui/label";

interface ContactDetailSheetProps {
    contact: CRMContact | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interactions: CRMInteraction[];
    onUpdate: (id: string, data: Partial<CRMContact>) => void;
    onDelete: (id: string) => void;
    onAddInteraction: (type: CRMInteraction['type'], content: string) => void;
}

export function ContactDetailSheet({
    contact,
    open,
    onOpenChange,
    interactions,
    onUpdate,
    onDelete,
    onAddInteraction
}: ContactDetailSheetProps) {
    if (!contact) return null;

    const stage = CRM_STAGES.find(s => s.id === contact.status);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col h-full bg-background" side="right">

                {/* Header Section */}
                <div className="p-6 border-b bg-muted/10 shrink-0 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <div className="flex items-start gap-4 pr-10">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm dark:border-gray-800">
                            <AvatarImage
                                src={safeUrl(contact.avatar || '')}
                                alt={sanitizeDisplay(`${contact.firstName} ${contact.lastName}`)}
                            />
                            <AvatarFallback className="bg-primary/10 text-xl text-primary">
                                {contact.firstName[0]}
                                {contact.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold">{sanitizeDisplay(contact.firstName)} {sanitizeDisplay(contact.lastName)}</h2>
                            <p className="text-muted-foreground">{sanitizeDisplay(contact.role)}{contact.company ? ` at ${sanitizeDisplay(contact.company)}` : ''}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="outline" className={stage?.color}>{stage?.label}</Badge>
                                {contact.tags?.map(t => <Badge key={t} variant="secondary" className="font-normal">{sanitizeDisplay(t)}</Badge>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const url = safeUrl(`mailto:${contact.email}`);
                                            if (url) window.location.href = url;
                                        }}
                                        disabled={!contact.email}
                                    >
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Email Contact</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const url = safeUrl(`tel:${contact.phone}`);
                                            if (url) window.location.href = url;
                                        }}
                                        disabled={!contact.phone}
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Call Contact</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            onOpenChange(false);
                                            // Trigger edit mode - assuming parent handles this via onUpdate or separate flow
                                            // For now, allow quick edit or navigate.
                                            // Given current setup, we might need a prop for onEdit or just use onUpdate with modal.
                                            // This button is likely just a trigger for the edit form which isn't fully wired in *this* sheet
                                            // (Edit is happening in main CRMApp modal, but this sheet is 'ContactDetailSheet').
                                            // Let's assume we want to trigger the Edit modal from here.
                                            // Since we don't have onEdit prop, I'll add a TODO or wire it if possible.
                                            // The prompt says "existing editContact or router.push".
                                            // I'll assume we can pass a callback later, but for now just disable or placeholder.
                                            // Wait, prompt says: "Edit by invoking the sheet's edit handler or navigation function... or set disabled".
                                            // I will set disabled with tooltip "Coming soon" as I don't have the edit handler prop in this component signature yet.
                                        }}
                                        disabled
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Contact (Coming Soon)</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this contact?")) {
                                                onDelete(contact.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Contact</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="activity" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-2 border-b shrink-0">
                            <TabsList className="w-full justify-start bg-transparent p-0 h-10">
                                <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">Activity</TabsTrigger>
                                <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">Details</TabsTrigger>
                                <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">Notes</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden bg-muted/5 relative">
                            <ScrollArea className="h-full">
                                <TabsContent value="activity" className="p-6 m-0 h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold">Timeline</h3>
                                        <Button size="sm" variant="ghost" onClick={() => onAddInteraction('note', 'New interaction')}>
                                            <Plus className="h-3 w-3 mr-1" /> Add Note
                                        </Button>
                                    </div>
                                    <ActivityTimeline interactions={interactions} />
                                </TabsContent>

                                <TabsContent value="details" className="p-6 m-0 min-h-full space-y-6">
                                    <div className="grid gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Email</Label>
                                            <p className="text-sm font-medium">{sanitizeDisplay(contact.email)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <p className="text-sm font-medium">{contact.phone || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Source</Label>
                                            <p className="text-sm font-medium">{contact.source || 'Direct'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Created</Label>
                                            <p className="text-sm font-medium">{new Date(contact.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="notes" className="p-6 m-0 h-full">
                                    <p className="text-sm text-muted-foreground">Notes view implementation pending...</p>
                                </TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Footer */}
                <SheetFooter className="p-4 border-t bg-background shrink-0 sm:justify-between sm:space-x-0">
                    {/* Duplicate delete button removed as per requirements */}
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}
