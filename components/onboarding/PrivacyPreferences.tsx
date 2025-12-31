"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Assuming standard UI switch
import { Label } from "@/components/ui/label"; // Assuming Label component
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { privacyDetailsSchema, type PrivacyDetailsInput } from "@/lib/onboarding-schemas";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface PrivacyPreferencesProps {
    onNext: () => void;
}

export function PrivacyPreferences({ onNext }: PrivacyPreferencesProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<PrivacyDetailsInput>({
        resolver: zodResolver(privacyDetailsSchema),
        defaultValues: {
            privacySettings: {
                profileVisibility: "community_members",
                showRealName: false,
                showLocation: true,
                allowEmailLookup: false
            },
            notificationPreferences: {
                emailWeeklyDigest: true,
                emailMessages: true
            }
        }
    });

    async function onSubmit(data: PrivacyDetailsInput) {
        setLoading(true);
        try {
            await fetch("/api/onboarding/privacy", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            // Finalize
            await fetch("/api/onboarding/complete", { method: "POST" });

            onNext(); // This might redirect to dashboard
            router.push("/dashboard"); // Force redirect as this is last step
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy</h3>

                    <FormField
                        control={form.control}
                        name="privacySettings.profileVisibility"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Visibility</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? "community_members"}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Everyone)</SelectItem>
                                        <SelectItem value="community_members">Community Members</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="privacySettings.showRealName"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Show Real Name</FormLabel>
                                    <FormDescription>
                                        Display your real name instead of username/handle.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <FormField
                        control={form.control}
                        name="notificationPreferences.emailMessages"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Email Messages</FormLabel>
                                    <FormDescription>
                                        Receive emails when you get a new message.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? true}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Finishing..." : "Complete Setup"}
                </Button>
            </form>
        </Form>
    );
}
