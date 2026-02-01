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
import { formatDistanceToNow } from "date-fns";

import { CRMContact, CRMInteraction, CRM_STAGES } from "@/lib/communityos/crm/types";
import { ActivityTimeline } from "./activity-timeline";
import { Input } from "@/components/ui/input"; // Using standard UI for edit mode inner parts if needed
import { Label } from "@/components/ui/label";

interface ContactDetailSheetProps {
    contact: CRMContact | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interactions: CRMInteraction[];
    onUpdate: (id: string, data: Partial<CRMContact>) => void;
    onAddInteraction: (type: CRMInteraction['type'], content: string) => void;
}

export function ContactDetailSheet({
    contact,
    open,
    onOpenChange,
    interactions,
    onUpdate,
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
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="text-lg">{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold">{contact.firstName} {contact.lastName}</h2>
                            <p className="text-muted-foreground">{contact.role}{contact.company ? ` at ${contact.company}` : ''}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="outline" className={stage?.color}>{stage?.label}</Badge>
                                {contact.tags?.map(t => <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button className="flex-1" variant="default">
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                        <Button className="flex-1" variant="outline">
                            <Phone className="h-4 w-4 mr-2" /> Call
                        </Button>
                        <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                        </Button>
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
                                            <p className="text-sm font-medium">{contact.email}</p>
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
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Contact
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}
