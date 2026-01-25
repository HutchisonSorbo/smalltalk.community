"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tenant } from "@/shared/schema";
import {
    updateTenantProfile,
    updateTenantImpactStats,
    updateTenantPrograms,
    updateTenantTeam,
    updateTenantGallery,
    updateTenantTestimonials,
    updateTenantCTAs,
    updateTenantEvents
} from "@/lib/communityos/actions";
import { uploadTenantImage } from "@/lib/communityos/upload-action";
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
    contactPhone: z.string().optional(),
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
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
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
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic details about your organisation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <FormLabel>Organisation Logo</FormLabel>
                                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-xl">
                                    {tenant.logoUrl ? (
                                        <img src={tenant.logoUrl} alt="Logo preview" className="h-32 w-32 object-contain rounded-lg shadow-sm" />
                                    ) : (
                                        <div className="h-32 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                            No Logo
                                        </div>
                                    )}
                                    <div className="flex flex-col w-full gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append("file", file);
                                                const res = await uploadTenantImage(tenant.id, formData, "logo");
                                                if (res.success && res.url) {
                                                    await updateTenantProfile(tenant.id, { logoUrl: res.url });
                                                    toast.success("Logo updated");
                                                    window.location.reload(); // Quick refresh to show new image
                                                } else {
                                                    toast.error(res.error || "Upload failed");
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-gray-500">Square recommended (max 2MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Image Upload */}
                            <div className="space-y-4">
                                <FormLabel>Hero Banner Image</FormLabel>
                                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-xl">
                                    {tenant.heroImageUrl ? (
                                        <img src={tenant.heroImageUrl} alt="Hero preview" className="h-32 w-full object-cover rounded-lg shadow-sm" />
                                    ) : (
                                        <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                            No Hero Image
                                        </div>
                                    )}
                                    <div className="flex flex-col w-full gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append("file", file);
                                                const res = await uploadTenantImage(tenant.id, formData, "hero");
                                                if (res.success && res.url) {
                                                    await updateTenantProfile(tenant.id, { heroImageUrl: res.url });
                                                    toast.success("Hero image updated");
                                                    window.location.reload();
                                                } else {
                                                    toast.error(res.error || "Upload failed");
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-gray-500">Panoramic recommended (max 5MB)</p>
                                    </div>
                                </div>
                            </div>
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
                        <CardTitle>Contact & Social</CardTitle>
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
                                                        <FormControl><Input {...field} placeholder="Facebook URL" /></FormControl>
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
                                                        <FormControl><Input {...field} placeholder="Instagram URL" /></FormControl>
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
                                                        <FormControl><Input {...field} placeholder="Twitter URL" /></FormControl>
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
                                                        <FormControl><Input {...field} placeholder="LinkedIn URL" /></FormControl>
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
                                                        <FormControl><Input {...field} placeholder="YouTube URL" /></FormControl>
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

// ============================================================================
// Sub-sections (usually in separate files, but keeping together for now)
// ============================================================================

function ImpactSection({ tenant }: { tenant: Tenant }) {
    const [stats, setStats] = useState(tenant.impactStats || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        const result = await updateTenantImpactStats(tenant.id, stats);
        if (result.success) toast.success("Impact stats updated");
        else toast.error(result.error || "Update failed");
        setIsSaving(false);
    }

    const addStat = () => setStats([...stats, { label: "", value: "", icon: "star" }]);
    const removeStat = (index: number) => setStats(stats.filter((_, i) => i !== index));
    const updateStat = (index: number, key: string, val: string) => {
        const newStats = [...stats];
        (newStats[index] as any)[key] = val;
        setStats(newStats);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Impact Statistics</CardTitle>
                <CardDescription>Showcase your organisation's impact with key metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-1 min-w-[120px]">
                            <label className="text-xs font-medium uppercase text-gray-500">Label</label>
                            <Input value={stat.label} onChange={(e) => updateStat(index, "label", e.target.value)} placeholder="e.g. Members" />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="text-xs font-medium uppercase text-gray-500">Value</label>
                            <Input value={stat.value} onChange={(e) => updateStat(index, "value", e.target.value)} placeholder="e.g. 1,000+" />
                        </div>
                        <div className="w-24">
                            <label className="text-xs font-medium uppercase text-gray-500">Icon</label>
                            <Input value={stat.icon} onChange={(e) => updateStat(index, "icon", e.target.value)} placeholder="Icon alias" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeStat(index)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addStat} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Metric
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Statistics
                </Button>
            </CardFooter>
        </Card>
    );
}

function ProgramsSection({ tenant }: { tenant: Tenant }) {
    const [programs, setPrograms] = useState(tenant.programs || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        const result = await updateTenantPrograms(tenant.id, programs);
        if (result.success) toast.success("Programs updated");
        else toast.error(result.error || "Update failed");
        setIsSaving(false);
    }

    const addProgram = () => setPrograms([...programs, { title: "", description: "" }]);
    const removeProgram = (index: number) => setPrograms(programs.filter((_, i) => i !== index));
    const updateProgram = (index: number, key: string, val: string) => {
        const newItems = [...programs];
        (newItems[index] as any)[key] = val;
        setPrograms(newItems);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Programs & Services</CardTitle>
                <CardDescription>Highlight what your organisation offers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {programs.map((item, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold">Program #{index + 1}</h4>
                            <Button variant="ghost" size="icon" onClick={() => removeProgram(index)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input value={item.title} onChange={(e) => updateProgram(index, "title", e.target.value)} placeholder="Program Title" />
                        <Textarea value={item.description} onChange={(e) => updateProgram(index, "description", e.target.value)} placeholder="Description..." />
                        <Input value={item.linkUrl} onChange={(e) => updateProgram(index, "linkUrl", e.target.value)} placeholder="Learn More URL (optional)" />
                    </div>
                ))}
                <Button variant="outline" onClick={addProgram} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Program
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Programs
                </Button>
            </CardFooter>
        </Card>
    );
}

function TeamSection({ tenant }: { tenant: Tenant }) {
    const [team, setTeam] = useState(tenant.teamMembers || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        const result = await updateTenantTeam(tenant.id, team);
        if (result.success) toast.success("Team updated");
        else toast.error(result.error || "Update failed");
        setIsSaving(false);
    }

    const addMember = () => setTeam([...team, { name: "", title: "" }]);
    const removeMember = (index: number) => setTeam(team.filter((_, i) => i !== index));
    const updateMember = (index: number, key: string, val: string) => {
        const newItems = [...team];
        (newItems[index] as any)[key] = val;
        setTeam(newItems);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Introduce your leadership and key staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {team.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 relative">
                        <Input value={item.name} onChange={(e) => updateMember(index, "name", e.target.value)} placeholder="Name" />
                        <Input value={item.title} onChange={(e) => updateMember(index, "title", e.target.value)} placeholder="Title / Role" />
                        <div className="md:col-span-2 flex gap-2">
                            <Input value={item.linkedinUrl} onChange={(e) => updateMember(index, "linkedinUrl", e.target.value)} placeholder="LinkedIn Profile URL" className="flex-1" />
                            <Button variant="ghost" size="icon" onClick={() => removeMember(index)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button variant="outline" onClick={addMember} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Team
                </Button>
            </CardFooter>
        </Card>
    );
}
