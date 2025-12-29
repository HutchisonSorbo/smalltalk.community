"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upsertVolunteerProfile } from "@/app/volunteer-passport/actions/volunteer";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    headline: z.string().max(255).optional(),
    bio: z.string().optional(),
    locationSuburb: z.string().max(100).optional(),
    locationPostcode: z.string().max(20).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface VolunteerProfileFormProps {
    initialData?: ProfileFormValues;
}

export function VolunteerProfileForm({ initialData }: VolunteerProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialData || {
            headline: "",
            bio: "",
            locationSuburb: "",
            locationPostcode: "",
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        try {
            await upsertVolunteerProfile({
                headline: data.headline || "",
                bio: data.bio || "",
                locationSuburb: data.locationSuburb || "",
                locationPostcode: data.locationPostcode || ""
            });
            toast({
                title: "Profile updated",
                description: "Your volunteer profile has been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                                <Input placeholder="E.g. Experienced event coordinator" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Tell us about your volunteering experience..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="locationSuburb"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suburb</FormLabel>
                                <FormControl>
                                    <Input placeholder="Melbourne" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="locationPostcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Postcode</FormLabel>
                                <FormControl>
                                    <Input placeholder="3000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </form>
        </Form>
    );
}

// CodeRabbit Audit Trigger
