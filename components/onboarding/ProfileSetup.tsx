"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSetupSchema, type ProfileSetupInput } from "@/lib/onboarding-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface ProfileSetupProps {
    onNext: () => void;
}

export function ProfileSetup({ onNext }: ProfileSetupProps) {
    const { user } = useAuth(); // Need user to check account type
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Check if we need to ask for DOB (if missing from user profile)
    // Note: user.dateOfBirth might be a Date object or string depending on useAuth implementation
    const needsDob = user && !user.dateOfBirth;

    const form = useForm<ProfileSetupInput>({
        resolver: zodResolver(profileSetupSchema),
        defaultValues: {
            headline: "",
            bio: "",
            location: "",
            profileImageUrl: "",
            dateOfBirth: undefined,
            // Defaults for Org can differ, handled by form logic or API
        },
    });

    async function onSubmit(data: ProfileSetupInput) {
        setLoading(true);
        try {
            if (needsDob && !data.dateOfBirth) {
                form.setError("dateOfBirth", { message: "Date of birth is required" });
                setLoading(false);
                return;
            }

            const supabase = createClient();
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) throw new Error("No active session");

            // Better to use a standard api client helper, but fetch is fine for now
            const res = await fetch("/api/onboarding/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save profile");

            onNext(); // Trigger parent to move step or refresh
            router.refresh();
        } catch (error) {
            console.error(error);
            // Show toast error
        } finally {
            setLoading(false);
        }
    }

    // Need to insert auth token logic properly. 
    // If useAuth relies on Supabase, we can get session. access_token needs to be passed.
    // Creating a helper for authorized fetch would be ideal for this task.

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {needsDob && (
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Required for age verification. You must be 13 or older.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                                <Input placeholder="Musician, Band, or Enthusiast" {...field} />
                            </FormControl>
                            <FormDescription>
                                A short description of who you are.
                            </FormDescription>
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
                                <Textarea placeholder="Tell the community about yourself..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Melbourne, VIC" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Basic URL input for MVP, replace with File Upload later */}
                <FormField
                    control={form.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Image URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Continue"}
                </Button>
            </form>
        </Form>
    );
}
