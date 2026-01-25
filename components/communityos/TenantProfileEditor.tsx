"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tenant } from "@/shared/schema";
import {
    updateTenantProfile,
    ActionResult
} from "@/lib/communityos/actions";
import { UploadField } from "./UploadField";
import { ImpactSection } from "./profile-sections/ImpactSection";
import { ProgramsSection } from "./profile-sections/ProgramsSection";
import { TeamSection } from "./profile-sections/TeamSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Globe, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

// ============================================================================
// Schemas
// ============================================================================

const generalSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    missionStatement: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional(),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional(),
    isPublic: z.boolean().default(false),
});

const contactSchema = z.object({
    contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    contactPhone: z.string().trim().regex(/^[\d\s+\-()]+$/, "Invalid phone format").optional().or(z.literal("")),
    address: z.string().optional(),
    socialLinks: z.object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        youtube: z.string().url().optional().or(z.literal("")),
    }).optional(),
});

// ============================================================================
// Main Component
// ============================================================================

interface TenantProfileEditorProps {
    tenant: Tenant;
}

export function TenantProfileEditor({ tenant }: TenantProfileEditorProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Forms
    const generalForm = useForm<z.infer<typeof generalSchema>>({
        resolver: zodResolver(generalSchema),
        defaultValues: {
            name: tenant.name || "",
            description: tenant.description || "",
            missionStatement: tenant.missionStatement || "",
            website: tenant.website || "",
            primaryColor: tenant.primaryColor || "#4F46E5",
            secondaryColor: tenant.secondaryColor || "#818CF8",
            isPublic: tenant.isPublic || false,
        },
    });

    const contactForm = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            contactEmail: tenant.contactEmail || "",
            contactPhone: tenant.contactPhone || "",
            address: tenant.address || "",
            socialLinks: (tenant.socialLinks as any) || {
                facebook: "",
                instagram: "",
                twitter: "",
                linkedin: "",
                youtube: "",
            },
        },
    });

    // Handlers
    async function onGeneralSubmit(values: z.infer<typeof generalSchema>) {
        setIsSaving(true);
        try {
            const result = await updateTenantProfile(tenant.id, values);
            if (result.success) {
                toast.success("General profile updated");
            } else {
                toast.error(result.error || "Update failed");
            }
        } catch (e: any) {
            console.error("onGeneralSubmit error", e);
            toast.error("Update failed: " + (e?.message || "unknown error"));
        } finally {
            setIsSaving(false);
        }
    }

    async function onContactSubmit(values: z.infer<typeof contactSchema>) {
        setIsSaving(true);
        try {
            const result = await updateTenantProfile(tenant.id, values);
            if (result.success) {
                toast.success("Contact information updated");
            } else {
                toast.error(result.error || "Update failed");
            }
        } catch (e: any) {
            console.error("onContactSubmit error", e);
            toast.error("Update failed: " + (e?.message || "unknown error"));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Tabs defaultValue="general" className="w-full max-w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-7 h-auto">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="programs">Programs</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">
                            <h2 className="text-xl font-bold inline">General Information</h2>
                        </CardTitle>
                        <CardDescription>Basic details about your organisation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <UploadField
                                tenantId={tenant.id}
                                label="Organisation Logo"
                                type="logo"
                                initialUrl={tenant.logoUrl}
                                recommendation="Square recommended (max 2MB)"
                            />
                            <UploadField
                                tenantId={tenant.id}
                                label="Hero Banner Image"
                                type="hero"
                                initialUrl={tenant.heroImageUrl}
                                recommendation="Panoramic recommended (max 5MB)"
                            />
                        </div>

                        <Form {...generalForm}>
                            <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                                <FormField
                                    control={generalForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organisation Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={generalForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Short Description</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="A one-sentence summary..." /></FormControl>
                                            <FormDescription>Shown in search results and headers.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={generalForm.control}
                                    name="missionStatement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mission Statement</FormLabel>
                                            <FormControl><Textarea {...field} className="min-h-[100px]" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={generalForm.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-gray-400" />
                                                        <Input {...field} placeholder="https://..." />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={generalForm.control}
                                        name="primaryColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primary Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input {...field} type="color" className="p-1 h-10 w-20" />
                                                        <Input {...field} placeholder="#000000" className="flex-1" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={generalForm.control}
                                        name="secondaryColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Secondary Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input {...field} type="color" className="p-1 h-10 w-20" />
                                                        <Input {...field} placeholder="#000000" className="flex-1" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={generalForm.control}
                                    name="isPublic"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base text-primary font-semibold uppercase tracking-tight">Public Profile</FormLabel>
                                                <FormDescription>
                                                    Make your organisation profile visible to the public.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">
                            <h2 className="text-xl font-bold inline">Contact & Social</h2>
                        </CardTitle>
                        <CardDescription>How people can reach your organisation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...contactForm}>
                            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={contactForm.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Public Email</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <Input {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={contactForm.control}
                                        name="contactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Public Phone</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <Input {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={contactForm.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Physical Address</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <Input {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Social Media Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={contactForm.control}
                                            name="socialLinks.facebook"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <Facebook className="h-4 w-4 text-[#1877F2]" />
                                                        <FormControl>
                                                            <Input {...field} aria-label="Facebook URL" placeholder="Facebook URL" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={contactForm.control}
                                            name="socialLinks.instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <Instagram className="h-4 w-4 text-[#E4405F]" />
                                                        <FormControl>
                                                            <Input {...field} aria-label="Instagram URL" placeholder="Instagram URL" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={contactForm.control}
                                            name="socialLinks.twitter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                                                        <FormControl>
                                                            <Input {...field} aria-label="Twitter URL" placeholder="Twitter URL" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={contactForm.control}
                                            name="socialLinks.linkedin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                                                        <FormControl>
                                                            <Input {...field} aria-label="LinkedIn URL" placeholder="LinkedIn URL" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={contactForm.control}
                                            name="socialLinks.youtube"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <Youtube className="h-4 w-4 text-[#FF0000]" />
                                                        <FormControl>
                                                            <Input {...field} aria-label="YouTube URL" placeholder="YouTube URL" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="impact">
                <ImpactSection tenant={tenant} />
            </TabsContent>

            <TabsContent value="programs">
                <ProgramsSection tenant={tenant} />
            </TabsContent>

            <TabsContent value="team">
                <TeamSection tenant={tenant} />
            </TabsContent>

            {/* Placeholder for other tabs */}
            <TabsContent value="gallery">
                <Card><CardContent className="pt-6 text-center text-gray-500">Gallery management coming soon...</CardContent></Card>
            </TabsContent>
            <TabsContent value="more">
                <Card><CardContent className="pt-6 text-center text-gray-500">Testimonials, Events and CTA management coming soon...</CardContent></Card>
            </TabsContent>
        </Tabs>
    );
}
