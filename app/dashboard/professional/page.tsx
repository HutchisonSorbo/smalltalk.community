"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertProfessionalProfileSchema, professionalRoles, victoriaRegions } from "@shared/schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Schema for form
const formSchema = insertProfessionalProfileSchema.pick({
    role: true,
    businessName: true,
    bio: true,
    location: true,
    services: true,
    rates: true,
    portfolioUrl: true,
    website: true,
    contactEmail: true,
    instagramUrl: true,
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfessionalEditorPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Check for existing profile
    const { data: existingProfile, isLoading: profileLoading } = useQuery({
        queryKey: ["professional-profile", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await fetch(`/api/professionals?userId=${user.id}`);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!user
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: "Producer",
            businessName: "",
            bio: "",
            location: "",
            services: "",
            rates: "",
            portfolioUrl: "",
            website: "",
            contactEmail: "",
            instagramUrl: "",
        },
    });

    // Load existing data
    useEffect(() => {
        if (existingProfile) {
            form.reset({
                role: existingProfile.role,
                businessName: existingProfile.businessName || "",
                bio: existingProfile.bio,
                location: existingProfile.location,
                services: existingProfile.services || "",
                rates: existingProfile.rates || "",
                portfolioUrl: existingProfile.portfolioUrl || "",
                website: existingProfile.website || "",
                contactEmail: existingProfile.contactEmail || "",
                instagramUrl: existingProfile.instagramUrl || "",
            });
        } else if (user?.email) {
            // Pre-fill email
            form.setValue("contactEmail", user.email);
        }
    }, [existingProfile, form, user]);

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(data: FormValues) {
        try {
            const url = existingProfile ? `/api/professionals/${existingProfile.id}` : "/api/professionals";
            const method = existingProfile ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to save profile");

            const saved = await response.json();

            toast({
                title: "Success",
                description: "Your professional profile has been saved.",
            });

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ["professional-profile"] });
            queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });

            router.push(`/professionals/${saved.id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        }
    }

    if (authLoading || profileLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        router.push("/login?redirect=/dashboard/professional");
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{existingProfile ? "Edit Professional Profile" : "Create Professional Profile"}</CardTitle>
                        <CardDescription>
                            List your services in the industry directory.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {professionalRoles.map((r) => (
                                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="businessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Acme Studios" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select region" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {victoriaRegions.map((region) => (
                                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio / About *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about your experience, style, and equipment..."
                                                    className="h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Services Offered</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="List specific services (e.g. Mixing, Mastering, Headshots, Video Production)"
                                                    className="h-24"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="rates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rates (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. $50/hr or Contact for Quote" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-medium">Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="portfolioUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Portfolio URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Cloudinary / SoundCloud / etc" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="instagramUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instagram</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="@username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Profile"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
