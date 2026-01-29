/**
 * CRM App Component
 * A Ditto-enabled CRM for managing community contacts
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Validation Schemas
 */
const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    email: z.string().email("Please enter a valid email address").or(z.literal("")).transform(v => v.trim()),
    phone: z.string().regex(/^[0-9+().\s-]{7,}$/, "Please enter a valid phone number").or(z.literal("")).transform(v => v.trim()),
    status: z.enum(["active", "inactive", "pending"]),
    segments: z.array(z.string()).optional(),
});

const interactionSchema = z.object({
    type: z.enum(["note", "email", "call", "meeting"]),
    content: z.string().min(1, "Interaction content cannot be empty").trim(),
});

interface Interaction {
    id: string;
    type: "note" | "email" | "call" | "meeting";
    content: string;
    createdAt: string;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: "active" | "inactive" | "pending";
    lastContacted?: string;
    segments?: string[];
    interactions?: Interaction[];
}

/**
 * Robust text moderation and sanitisation helper.
 * Implements basic HTML entity encoding and trimming.
 */
const moderateText = (text: string | undefined): string => {
    if (!text) return "";
    const trimmed = text.trim();
    // Encode HTML entities to prevent XSS (OWASP A05)
    return trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export function CRMApp() {
    const { tenant, isLoading } = useTenant();

    const { documents: contacts, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<Contact>({
            collection: "crm_contacts",
            tenantId: tenant?.id || ""
        });

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [viewingContact, setViewingContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState<Partial<Contact>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [newInteraction, setNewInteraction] = useState({ type: "note", content: "" });



    if (isLoading) {
        return <div className="p-4"><div className="h-6 w-48 rounded bg-gray-200 animate-pulse" /></div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load CRM - Organisation context not available.</p>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            const validationResult = contactSchema.safeParse({
                ...formData,
                email: formData.email ?? "",
                phone: formData.phone ?? "",
                status: formData.status || "active",
                segments: formData.segments || []
            });

            if (!validationResult.success) {
                const errors: Record<string, string> = {};
                validationResult.error.issues.forEach((issue) => {
                    if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
                });
                setFormErrors(errors);
                return;
            }

            const validatedData = validationResult.data;
            const id = isEditing === "new" ? crypto.randomUUID() : (isEditing as string);
            const existingContact = contacts.find(c => c.id === id);

            const updatedContact: Contact = {
                id,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                phone: validatedData.phone,
                status: validatedData.status,
                lastContacted: new Date().toISOString(),
                segments: validatedData.segments,
                interactions: existingContact?.interactions || [],
            };

            await upsertDocument(id, updatedContact);
            setIsEditing(null);
            setFormData({});
            setFormErrors({});
        } catch (error) {
            console.error("Failed to save contact:", { contactId: isEditing, error });
        }
    };

    const addInteraction = async (contactId: string) => {
        try {
            const validationResult = interactionSchema.safeParse(newInteraction);
            if (!validationResult.success) return;

            const contact = contacts.find(c => c.id === contactId);
            if (!contact) return;

            const interaction: Interaction = {
                id: crypto.randomUUID(),
                type: validationResult.data.type,
                content: validationResult.data.content,
                createdAt: new Date().toISOString()
            };

            const updatedContact: Contact = {
                ...contact,
                interactions: [interaction, ...(contact.interactions || [])],
                lastContacted: interaction.createdAt
            };

            await upsertDocument(contactId, updatedContact);
            setViewingContact(updatedContact);
            setNewInteraction({ type: "note", content: "" });
        } catch (error) {
            console.error("Failed to add interaction:", { contactId, error });
        }
    };

    return (
        <div className="space-y-6 max-w-full" aria-hidden={viewingContact ? "true" : "false"}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Pro</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage community relationships with interaction logs and segments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-xs text-gray-500">{isOnline ? "Online Syncing" : "Offline Mode"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ status: "active", segments: [] });
                            setFormErrors({});
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                    >
                        Add Contact
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold">{isEditing === "new" ? "New Contact" : "Edit Contact"}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName || ""}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={`mt-1 block w-full rounded-md border ${formErrors.firstName ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm`}
                            />
                            {formErrors.firstName && <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                value={formData.lastName || ""}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className={`mt-1 block w-full rounded-md border ${formErrors.lastName ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm`}
                            />
                            {formErrors.lastName && <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`mt-1 block w-full rounded-md border ${formErrors.email ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm`}
                            />
                            {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input
                                id="phone"
                                type="text"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={`mt-1 block w-full rounded-md border ${formErrors.phone ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm`}
                            />
                            {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="segments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Segments (comma separated)</label>
                            <input
                                id="segments"
                                type="text"
                                placeholder="Volunteer, Donor, Mental Health Support"
                                value={formData.segments?.join(", ") || ""}
                                onChange={(e) => setFormData({ ...formData, segments: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(null);
                                setFormErrors({});
                            }}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            <Dialog open={!!viewingContact} onOpenChange={(open) => !open && setViewingContact(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {viewingContact && `${moderateText(viewingContact.firstName)} ${moderateText(viewingContact.lastName)}`}
                        </DialogTitle>
                    </DialogHeader>

                    {viewingContact && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="truncate"><span className="font-semibold">Email:</span> {moderateText(viewingContact.email)}</div>
                                <div className="truncate"><span className="font-semibold">Phone:</span> {moderateText(viewingContact.phone)}</div>
                                <div className="col-span-2">
                                    <span className="font-semibold">Segments:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {viewingContact.segments?.map((s, idx) => (
                                            <span key={`${s}-${idx}`} className="max-w-[8rem] truncate rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {moderateText(s)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="mb-3 font-semibold">Interaction Log</h4>
                                <div className="mb-4 flex gap-2">
                                    <label htmlFor="interaction-type" className="sr-only">Interaction type</label>
                                    <select
                                        id="interaction-type"
                                        className="rounded border p-2 text-sm dark:bg-gray-700"
                                        value={newInteraction.type}
                                        onChange={e => setNewInteraction({ ...newInteraction, type: e.target.value })}
                                    >
                                        <option value="note">Note</option>
                                        <option value="email">Email</option>
                                        <option value="call">Call</option>
                                        <option value="meeting">Meeting</option>
                                    </select>
                                    <label htmlFor="interaction-content" className="sr-only">Interaction details</label>
                                    <input
                                        id="interaction-content"
                                        type="text"
                                        className="flex-1 rounded border p-2 text-sm dark:bg-gray-700"
                                        placeholder="Add a note or log an interaction..."
                                        value={newInteraction.content}
                                        onChange={e => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addInteraction(viewingContact.id)}
                                        className="rounded bg-primary px-4 text-sm text-white"
                                        aria-label="Log interaction"
                                    >
                                        Log
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-3">
                                    {viewingContact.interactions?.map(i => (
                                        <div key={i.id} className="rounded border bg-gray-50 p-3 text-sm dark:bg-gray-900/50">
                                            <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                                                <span className="uppercase font-bold">{moderateText(i.type)}</span>
                                                <span>{new Date(i.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="line-clamp-3">{moderateText(i.content)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Segments</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No contacts found. Add your first contact to get started.
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => setViewingContact(contact)}
                                            className="block max-w-[12rem] truncate text-left font-medium text-gray-900 hover:underline dark:text-white"
                                        >
                                            {moderateText(contact.firstName)} {moderateText(contact.lastName)}
                                        </button>
                                        <div className="max-w-[14rem] truncate text-xs text-gray-500">{moderateText(contact.email)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.segments?.map((s, idx) => (
                                                <span key={`${s}-${idx}`} className="max-w-[8rem] truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {moderateText(s)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${contact.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                            contact.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                            }`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(contact.id);
                                                setFormData(contact);
                                                setFormErrors({});
                                            }}
                                            className="mr-3 text-primary hover:text-primary/80"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await deleteDocument(contact.id);
                                                } catch (error) {
                                                    console.error("Failed to delete contact:", { contactId: contact.id, error });
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}