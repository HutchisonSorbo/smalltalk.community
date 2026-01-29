/**
 * CRM App Component
 * A Ditto-enabled CRM for managing community contacts
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useTenant } from "@/components/communityos/TenantProvider";

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
 * Content moderation and sanitisation helper.
 * Applies HTML entity encoding and basic trimming.
 */
const moderateText = (text: string): string => {
    if (!text) return "";
    const trimmed = text.trim();
    return trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export function CRMApp() {
    const { tenant, isLoading } = useTenant();
    const modalRef = useRef<HTMLDivElement>(null);

    const { documents: contacts, upsertDocument, deleteDocument, isOnline } =
        useDittoSync<Contact>({
            collection: "crm_contacts",
            tenantId: tenant?.id || ""
        });

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [viewingContact, setViewingContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState<Partial<Contact>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [newInteraction, setNewInteraction] = useState<{ type: string; content: string }>({
        type: "note",
        content: ""
    });

    // Focus trap logic for modal accessibility
    useEffect(() => {
        if (viewingContact && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            firstElement?.focus();

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== "Tab") return;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [viewingContact]);

    if (isLoading) {
        return <div className="p-4"><div className="h-6 w-48 rounded bg-gray-200 animate-pulse" aria-hidden="true" /></div>;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600 border rounded-lg border-red-200 bg-red-50">
                <p>Unable to load CRM - Organisation context not available.</p>
            </div>
        );
    }

    const handleSave = () => {
        const firstName = (formData.firstName || "").trim();
        const lastName = (formData.lastName || "").trim();
        const email = (formData.email || "").trim();
        const phone = (formData.phone || "").trim();
        const segments = (formData.segments || []).map(s => s.trim()).filter(Boolean);

        const errors: Record<string, string> = {};
        if (!firstName || !lastName) {
            errors.firstName = !firstName ? "First name is required" : "";
            errors.lastName = !lastName ? "Last name is required" : "";
            errors.general = "First and last name are required";
        }
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }
        
        if (phone && !/^[0-9+().\s-]{7,}$/.test(phone)) {
            errors.phone = "Please enter a valid phone number";
        }

        if (Object.keys(errors).length > 0 && Object.values(errors).some(v => v !== "")) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        const allowedStatuses = ["active", "inactive", "pending"] as const;
        const status = allowedStatuses.includes(formData.status as any) 
            ? (formData.status as "active" | "inactive" | "pending") 
            : "active";

        const id = isEditing === "new" ? crypto.randomUUID() : (isEditing as string);
        const existingContact = contacts.find(c => c.id === id);

        const contactData: Contact = {
            id,
            firstName,
            lastName,
            email,
            phone,
            status,
            lastContacted: new Date().toISOString(),
            segments,
            interactions: existingContact?.interactions || [],
        };

        upsertDocument(id, contactData);
        setIsEditing(null);
        setFormData({});
    };

    const addInteraction = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        const content = newInteraction.content.trim();
        
        const allowedTypes = ["note", "email", "call", "meeting"] as const;
        const interactionType = allowedTypes.includes(newInteraction.type as any)
            ? (newInteraction.type as Interaction["type"])
            : "note";

        if (contact && content) {
            const interaction: Interaction = {
                id: crypto.randomUUID(),
                type: interactionType,
                content: content,
                createdAt: new Date().toISOString()
            };

            const updatedContact: Contact = {
                ...contact,
                interactions: [interaction, ...(contact.interactions || [])],
                lastContacted: interaction.createdAt
            };

            upsertDocument(contactId, updatedContact);
            setViewingContact(updatedContact);
            setNewInteraction({ type: "note", content: "" });
        }
    };

    return (
        <div className="space-y-6 max-w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage your community contacts and relationships.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-orange-500"}`} aria-hidden="true" />
                        <span className="text-xs text-gray-500">{isOnline ? "Online Syncing" : "Offline Mode"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing("new");
                            setFormData({ status: "active" });
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
                    {formErrors.general && <p className="mb-4 text-sm text-red-600" role="alert">{formErrors.general}</p>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                title="First Name"
                                value={formData.firstName || ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, firstName: e.target.value });
                                    if (formErrors.firstName || formErrors.general) setFormErrors({});
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                            {formErrors.firstName && <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.firstName}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                title="Last Name"
                                value={formData.lastName || ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, lastName: e.target.value });
                                    if (formErrors.lastName || formErrors.general) setFormErrors({});
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                            {formErrors.lastName && <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.lastName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                id="email"
                                type="email"
                                title="Email Address"
                                value={formData.email || ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (formErrors.email) setFormErrors({});
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                            {formErrors.email && <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input
                                id="phone"
                                type="text"
                                title="Phone Number"
                                value={formData.phone || ""}
                                onChange={(e) => {
                                    setFormData({ ...formData, phone: e.target.value });
                                    if (formErrors.phone) setFormErrors({});
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                            {formErrors.phone && <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.phone}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="segments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Segments (comma separated)</label>
                            <input
                                id="segments"
                                type="text"
                                title="Segments"
                                placeholder="Volunteer, Donor, Support"
                                value={formData.segments?.join(", ") || ""}
                                onChange={(e) => setFormData({ ...formData, segments: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(null)}
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

            {viewingContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="view-contact-title">
                    <div ref={modalRef} className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between border-b pb-4">
                            <h3 id="view-contact-title" className="text-xl font-bold truncate">
                                {moderateText(viewingContact.firstName)} {moderateText(viewingContact.lastName)}
                            </h3>
                            <button
                                type="button"
                                aria-label="Close contact details"
                                onClick={() => setViewingContact(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
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

                        <div className="mb-4 border-t pt-4">
                            <h4 className="mb-3 font-semibold">Interaction Log</h4>
                            <div className="mb-4 flex gap-2">
                                <label htmlFor="interaction-type" className="sr-only">Interaction type</label>
                                <select
                                    id="interaction-type"
                                    className="rounded border p-2 text-sm dark:bg-gray-700"
                                    title="Interaction Type"
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
                                    placeholder="Add a note..."
                                    value={newInteraction.content}
                                    onChange={e => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => addInteraction(viewingContact.id)}
                                    className="rounded bg-primary px-4 text-sm text-white"
                                >
                                    Log
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-3">
                                {viewingContact.interactions?.map(i => (
                                    <div key={i.id} className="rounded border bg-gray-50 p-3 text-sm dark:bg-gray-900/50">
                                        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                                            <span className="uppercase font-bold">{i.type}</span>
                                            <span>{new Date(i.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p>{moderateText(i.content)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
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
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <button
                                            type="button"
                                            onClick={() => setViewingContact(contact)}
                                            className="hover:underline text-left"
                                        >
                                            {moderateText(contact.firstName)} {moderateText(contact.lastName)}
                                        </button>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {moderateText(contact.email)}
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
                                            onClick={() => deleteDocument(contact.id)}
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