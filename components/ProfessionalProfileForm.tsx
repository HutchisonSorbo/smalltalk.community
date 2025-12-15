"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertProfessionalProfileSchema, professionalRoles, victoriaRegions, ProfessionalProfile } from "@shared/schema";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    profileImageUrl: true,
    isContactInfoPublic: true,
});

type FormValues = z.infer<typeof formSchema>;

interface ProfessionalProfileFormProps {
    profile?: ProfessionalProfile | null;
    onSuccess?: () => void;
    showCancel?: boolean;
    onCancel?: () => void;
}

export function ProfessionalProfileForm({ profile, onSuccess, showCancel, onCancel }: ProfessionalProfileFormProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: "Producer",
            businessName: "",
            bio: "",
            location: "Melbourne CBD",
            services: "",
            rates: "",
            portfolioUrl: "",
            website: "",
            contactEmail: "",
            instagramUrl: "",
            profileImageUrl: "",
            isContactInfoPublic: false,
        },
    });

    // Load existing data
    useEffect(() => {
        if (profile) {
            form.reset({
                role: profile.role,
                businessName: profile.businessName || "",
                bio: profile.bio,
                location: profile.location,
                services: profile.services || "",
                rates: profile.rates || "",
                portfolioUrl: profile.portfolioUrl || "",
                website: profile.website || "",
                contactEmail: profile.contactEmail || "",
                instagramUrl: profile.instagramUrl || "",
                profileImageUrl: profile.profileImageUrl || "",
                isContactInfoPublic: profile.isContactInfoPublic || false,
            });
        } else if (user?.email) {
            // Pre-fill email
            form.setValue("contactEmail", user.email);
        }
    }, [profile, form, user]);

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(data: FormValues) {
        try {
            const url = profile ? `/api/professionals/${profile.id}` : "/api/professionals";
            const method = profile ? "PATCH" : "POST";

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
            queryClient.invalidateQueries({ queryKey: ["/api/my/profiles"] });

            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/professionals/${saved.id}`);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || "Producer"}>
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
                                    <Input placeholder="e.g. Acme Studios" {...field} value={field.value || ""} />
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
                            <Select onValueChange={field.onChange} value={field.value || ""}>
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
                                    value={field.value || ""}
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
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Image</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || null}
                                    onChange={(url) => field.onChange(url)}
                                    label="Upload Profile Image"
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
                                    <Input placeholder="email@example.com" {...field} value={field.value || ""} />
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
                                    <Input placeholder="e.g. $50/hr or Contact for Quote" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isContactInfoPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Make Contact Info Public
                                </FormLabel>
                                <FormDescription>
                                    If unchecked, users must request access to see your email/phone.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

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
                                        <Input placeholder="https://..." {...field} value={field.value || ""} />
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
                                        <Input placeholder="Cloudinary / SoundCloud / etc" {...field} value={field.value || ""} />
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
                                        <Input placeholder="@username" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Profile"
                        )}
                    </Button>
                    {showCancel && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}

