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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UserPreference } from "@/shared/schema";
import { updatePreferences } from "../actions";

const notificationsFormSchema = z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

interface NotificationsFormProps {
    initialData: UserPreference;
}

export function NotificationsForm({ initialData }: NotificationsFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NotificationsFormValues>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            emailNotifications: initialData.emailNotifications ?? true,
            pushNotifications: initialData.pushNotifications ?? true,
            marketingEmails: initialData.marketingEmails ?? false,
        },
    });

    async function onSubmit(data: NotificationsFormValues) {
        setIsLoading(true);
        try {
            const result = await updatePreferences(data);
            if (result.success) {
                toast({
                    title: "Settings updated",
                    description: "Your notification preferences have been saved.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update settings.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Email Notifications
                                    </FormLabel>
                                    <FormDescription>
                                        Receive emails about your account activity and updates.
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
                        name="pushNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Push Notifications
                                    </FormLabel>
                                    <FormDescription>
                                        Receive push notifications on your devices.
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
                        name="marketingEmails"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Marketing Emails
                                    </FormLabel>
                                    <FormDescription>
                                        Receive emails about new features and promotions.
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
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save preferences"}
                </Button>
            </form>
        </Form>
    );
}
