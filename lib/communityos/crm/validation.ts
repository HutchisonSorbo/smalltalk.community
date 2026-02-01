
import { z } from 'zod';
import { CRMStatus } from './types';

// Regex for basic phone validation (Australian + Int)
const phoneRegex = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$|^\+?[0-9]{8,15}$/;

export const contactSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
    status: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost', 'active', 'inactive'] as [CRMStatus, ...CRMStatus[]]).default('lead'),
    company: z.string().optional(),
    role: z.string().optional(),
    segments: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    value: z.number().min(0).optional(),
    avatar: z.string().url().optional().or(z.literal("")),
    nextFollowUp: z.string().datetime().optional().or(z.literal("")), // ISO Date string
});

export const interactionSchema = z.object({
    type: z.enum(['note', 'email', 'call', 'meeting', 'task']),
    content: z.string().min(1, "Content is required"),
    date: z.string().datetime().default(() => new Date().toISOString()),
    duration: z.number().min(0).optional(),
    outcome: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type InteractionFormData = z.infer<typeof interactionSchema>;
