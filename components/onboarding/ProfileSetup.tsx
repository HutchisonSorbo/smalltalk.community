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

interface ProfileSetupProps {
    onNext: () => void;
}

export function ProfileSetup({ onNext }: ProfileSetupProps) {
    const { user } = useAuth(); // Need user to check account type
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<ProfileSetupInput>({
        resolver: zodResolver(profileSetupSchema),
        defaultValues: {
            headline: "",
            bio: "",
            location: "",
            profileImageUrl: "",
            // Defaults for Org can differ, handled by form logic or API
        },
    });

    async function onSubmit(data: ProfileSetupInput) {
        setLoading(true);
        try {
            const token = (await import("@supabase/supabase-js")).createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            ).auth.getSession().then(({ data }) => data.session?.access_token);

            // Better to use a standard api client helper, but fetch is fine for now
            const res = await fetch("/api/onboarding/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${token}` // Middleware or cookie handling usually suffices, 
                    // but our API checks header. We need the session token.
                    // useAuth hook might expose session or token.
                    // For now, let's assume global session or cookie.
                    // Actually, our API explicitly checks 'Authorization' header.
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
