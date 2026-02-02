"use client";

import { useState, useMemo } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { CRMContact, CRMInteraction, CRMStatus } from "@/lib/communityos/crm/types";
import { contactSchema, interactionSchema } from "@/lib/communityos/crm/validation";

// UI Components
import { PipelineBoard } from "./crm/pipeline-board";
import { ContactDetailSheet } from "./crm/contact-detail-sheet";
import { ContactCard } from "./crm/contact-card";
import { COSBulkActions } from "@/components/communityos/ui/cos-bulk-actions";
import { COSSearch } from "@/components/communityos/ui/cos-search";
import { COSFilterBar, FilterOption } from "@/components/communityos/ui/cos-filter-bar";
import { COSFab } from "@/components/communityos/ui/cos-fab";
import { SegmentBuilder, SegmentFilter } from "./crm/segment-builder";
import { ExportDialog } from "./crm/export-dialog";
import { ImportWizard } from "./crm/import-wizard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or alert

type ViewMode = 'board' | 'list';

export function CRMApp() {
    const { tenant, isLoading: isTenantLoading } = useTenant();

    // Data Sync
    const { documents, upsertDocument, deleteDocument, isOnline } = useDittoSync<CRMContact>({
        collection: "crm_contacts",
        tenantId: tenant?.id || ""
    });

    // Local State
    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filter State
    const [filters, setFilters] = useState<SegmentFilter[]>([]);
    const [quickFilters, setQuickFilters] = useState<FilterOption[]>([
        { id: 'leads', label: 'Leads', active: false },
        { id: 'active', label: 'Active Customers', active: false },
        { id: 'my-contacts', label: 'My Contacts', active: false },
    ]);

    // Dialogs
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // --- Derived Data ---

    const filteredContacts = useMemo(() => {
        let result = documents || [];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.firstName.toLowerCase().includes(q) ||
                c.lastName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.company?.toLowerCase().includes(q)
            );
        }

        // Quick Filters (Simple implementation)
        if (quickFilters.find(f => f.id === 'leads' && f.active)) {
            result = result.filter(c => c.status === 'lead');
        }
        if (quickFilters.find(f => f.id === 'active' && f.active)) {
            result = result.filter(c => c.status === 'active' || c.status === 'won');
        }

        // Advanced Filters (SegmentBuilder)
        filters.forEach(filter => {
            if (filter.field === 'tags' && filter.operator === 'contains') {
                result = result.filter(c => c.tags?.includes(filter.value));
            }
            if (filter.field === 'company' && filter.operator === 'equals') {
                result = result.filter(c => c.company === filter.value);
            }
        });

        return result;
    }, [documents, searchQuery, quickFilters, filters]);

    // --- Actions ---

    const handleCreateContact = async () => {
        const newContact: CRMContact = {
            id: crypto.randomUUID(),
            firstName: "New",
            lastName: "Contact",
            email: "",
            phone: "",
            status: 'lead',
            organisationId: tenant?.id || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            segments: []
        };
        await upsertDocument(newContact.id, newContact);
        setSelectedContact(newContact);
        setIsSheetOpen(true);
    };

    const handleUpdateContact = async (id: string, data: Partial<CRMContact>) => {
        const existing = documents.find(c => c.id === id);
        if (!existing) return;

        await upsertDocument(id, { ...existing, ...data, updatedAt: new Date().toISOString() });

        // Update local selected state if viewing
        if (selectedContact?.id === id) {
            setSelectedContact({ ...existing, ...data } as CRMContact);
        }
    };

    const handleAddInteraction = async (type: CRMInteraction['type'], content: string) => {
        if (!selectedContact) return;

        const newInteraction: CRMInteraction = {
            id: crypto.randomUUID(),
            contactId: selectedContact.id,
            type,
            content,
            date: new Date().toISOString(),
            createdBy: 'user', // Placeholder, ideally from auth
            createdAt: new Date().toISOString(),
        };

        const updatedContact = {
            ...selectedContact,
            interactions: [...(selectedContact.interactions || []), newInteraction],
            updatedAt: new Date().toISOString()
        };

        await upsertDocument(selectedContact.id, updatedContact);
        setSelectedContact(updatedContact);
        toast.success("Interaction added");
    };

    const handleMoveStatus = async (id: string, newStatus: string) => {
        await handleUpdateContact(id, { status: newStatus as CRMStatus });
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedIds.size} contacts?`)) return;
        for (const id of Array.from(selectedIds)) {
            await deleteDocument(id);
        }
        setSelectedIds(new Set());
    };

    // --- Render Helpers ---

    if (isTenantLoading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    if (!tenant) return <div className="p-8 text-center text-red-500">No organisation context found.</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {/* Top Bar */}
            <div className="flex-none p-4 space-y-4 border-b bg-muted/5 z-10">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'board' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('board')}
                            aria-label="Board view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCreateContact} className="hidden md:flex">
                            Add Contact
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="w-full md:w-72">
                        <COSSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search contacts..."
                        />
                    </div>
                    <div className="flex-1 w-full overflow-hidden">
                        <COSFilterBar
                            filters={quickFilters}
                            onFilterClick={(id) => setQuickFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))}
                            onClearAll={() => setQuickFilters(prev => prev.map(f => ({ ...f, active: false })))}
                        />
                    </div>
                </div>

                {/* Advanced Segments (Optional toggle moved to separate row if needed) */}
                {/* <SegmentBuilder ... /> */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'board' ? (
                    <div className="h-full p-4 overflow-x-auto overflow-y-hidden">
                        <PipelineBoard
                            contacts={filteredContacts}
                            onMove={handleMoveStatus}
                            onContactClick={(c) => { setSelectedContact(c); setIsSheetOpen(true); }}
                            onAddClick={() => handleCreateContact()}
                            className="h-full"
                        />
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredContacts.map(contact => (
                                <ContactCard
                                    key={contact.id}
                                    contact={contact}
                                    onClick={() => { setSelectedContact(contact); setIsSheetOpen(true); }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Details Sheet */}
            <ContactDetailSheet
                contact={selectedContact}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                interactions={selectedContact?.interactions || []}
                onUpdate={handleUpdateContact}
                onDelete={async (id) => {
                    await deleteDocument(id);
                    setIsSheetOpen(false);
                    setSelectedContact(null);
                    toast.success("Contact deleted");
                }}
                onAddInteraction={handleAddInteraction}
            />

            {/* Floating Action Button (Mobile) */}
            <COSFab
                className="md:hidden"
                onClick={handleCreateContact}
                stickyBottomNav
            />

            {/* Bulk Actions */}
            <COSBulkActions
                selectedCount={selectedIds.size}
                onClear={() => setSelectedIds(new Set())}
                onDelete={handleDeleteSelected}
                onExport={() => setIsExportOpen(true)}
            />

            {/* Modals */}
            <ExportDialog
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                count={selectedIds.size > 0 ? selectedIds.size : filteredContacts.length}
                selectedCount={selectedIds.size}
                onExport={(opts) => {
                    console.log("Exporting", opts);
                    toast.success(`Exporting ${selectedIds.size > 0 ? selectedIds.size : filteredContacts.length} contacts...`);
                    setIsExportOpen(false);
                }}
            />

            <ImportWizard
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={async (data) => {
                    // Bulk create logic
                    let count = 0;
                    for (const item of data) {
                        const newContact: CRMContact = {
                            id: crypto.randomUUID(),
                            firstName: item.firstName || 'Unknown',
                            lastName: item.lastName || '',
                            email: item.email || '',
                            phone: '',
                            status: (item.status?.toLowerCase() as CRMStatus) || 'lead',
                            organisationId: tenant?.id || "",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            segments: []
                        };
                        await upsertDocument(newContact.id, newContact);
                        count++;
                    }
                    toast.success(`Imported ${count} contacts`);
                    setIsImportOpen(false);
                }}
            />
        </div>
    );
}