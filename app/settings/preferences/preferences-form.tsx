"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UserPreference } from "@/shared/schema";
import { updatePreferences } from "../actions";
import { useTheme } from "next-themes";

const preferencesFormSchema = z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.enum(["en-AU", "en-GB", "en-US"]),
    highContrast: z.boolean(),
    reducedMotion: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

interface PreferencesFormProps {
    initialData: UserPreference;
}

export function PreferencesForm({ initialData }: PreferencesFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { setTheme } = useTheme();

    const form = useForm<PreferencesFormValues>({
        resolver: zodResolver(preferencesFormSchema),
        defaultValues: {
            theme: (initialData.theme as any) ?? "system",
            language: (initialData.language as any) ?? "en-AU",
            highContrast: initialData.highContrast ?? false,
            reducedMotion: initialData.reducedMotion ?? false,
        },
    });

    async function onSubmit(data: PreferencesFormValues) {
        setIsLoading(true);
        try {
            const result = await updatePreferences(data);
            if (result.success) {
                setTheme(data.theme); // Apply theme immediately
                toast({
                    title: "Preferences updated",
                    description: "Your experience settings have been saved.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update preferences.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("[PreferencesForm] Unexpected error saving preferences:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while saving your preferences.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-full">
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Appearance Theme</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a theme" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Choose how the application looks to you.
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="en-AU">English (Australia)</SelectItem>
                                        <SelectItem value="en-GB">English (UK)</SelectItem>
                                        <SelectItem value="en-US">English (US)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Your preferred language for content and emails.
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Accessibility</h4>
                    <div className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="highContrast"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">High Contrast</FormLabel>
                                        <FormDescription>
                                            Increase contrast for better readability.
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
                        <FormField
                            control={form.control}
                            name="reducedMotion"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Reduced Motion</FormLabel>
                                        <FormDescription>
                                            Minimise animations and transitions.
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
                    </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save preferences"}
                </Button>
            </form>
        </Form>
    );
}
