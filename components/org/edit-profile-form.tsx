"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateTenantProfile } from "@/app/org/[code]/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { PublicTenant } from "@/lib/communityos/tenant-context";

// Schema matching the server action validation
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    missionStatement: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color (e.g. #FF0000)").optional().or(z.literal("")),
    facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

// --- Subcomponents ---

function BasicInfo({ control }: { control: any }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Info</h3>
            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Organisation Name</FormLabel>
                        <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="missionStatement"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl><Textarea placeholder="Our mission is..." className="resize-none h-20" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="About us..." className="resize-none h-32" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="primaryColor"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Primary Brand Color</FormLabel>
                        <div className="flex gap-2">
                            <FormControl><Input placeholder="#000000" {...field} /></FormControl>
                            <div className="w-10 h-10 rounded border shadow-sm" style={{ backgroundColor: field.value || '#ffffff' }} />
                        </div>
                        <FormDescription>Hex code format (e.g. #FF5733)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

function ContactLocation({ control }: { control: any }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Contact & Location</h3>
            <FormField
                control={control}
                name="website"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="contactEmail"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl><Input placeholder="contact@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="contactPhone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St, City" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

function SocialLinks({ control }: { control: any }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["facebook", "instagram", "twitter", "linkedin", "youtube"].map((platform) => (
                    <FormField
                        key={platform}
                        control={control}
                        name={platform as any}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="capitalize">{platform === "twitter" ? "X (Twitter)" : platform}</FormLabel>
                                <FormControl><Input placeholder={`https://${platform}.com/...`} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

function FormActions({ isSubmitting, onSuccess }: { isSubmitting: boolean, onSuccess?: () => void }) {
    return (
        <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-950 border-t mt-6 flex justify-end gap-2">
            {onSuccess && (
                <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
    );
}

// --- Main Component ---

interface EditProfileFormProps {
    tenant: PublicTenant;
    onSuccess?: () => void;
}

export function EditProfileForm({ tenant, onSuccess }: EditProfileFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const socialLinks = tenant.socialLinks || {};

    const defaultValues: FormValues = {
        name: tenant.name || "",
        description: tenant.description || "",
        missionStatement: tenant.missionStatement || "",
        website: tenant.website || "",
        contactEmail: tenant.contactEmail || "",
        contactPhone: tenant.contactPhone || "",
        address: tenant.address || "",
        primaryColor: tenant.primaryColor || "",
        facebook: socialLinks.facebook ?? "",
        instagram: socialLinks.instagram ?? "",
        twitter: socialLinks.twitter ?? "",
        linkedin: socialLinks.linkedin ?? "",
        youtube: socialLinks.youtube ?? "",
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) formData.append(key, value);
            });

            const result = await updateTenantProfile(tenant.code, formData);

            if (result.error) {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Profile updated successfully." });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("[EditProfileForm:onSubmit] Error submitting form:", {
                tenantCode: tenant.code,
                error,
                formData: data // Be careful logging PI, but for debug context ok
            });
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <BasicInfo control={form.control} />
                <ContactLocation control={form.control} />
                <SocialLinks control={form.control} />
                <FormActions isSubmitting={isSubmitting} onSuccess={onSuccess} />
            </form>
        </Form>
    );
}
