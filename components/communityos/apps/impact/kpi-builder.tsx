"use client";

import React, { useState } from "react";
import { z } from "zod";
import { ImpactKPI } from "@/lib/communityos/impact/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { COSButton as Button } from "@/components/communityos/ui/cos-button"; // Using COS Button
import { AlertCircle, CheckCircle2 } from "lucide-react";

const kpiSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    dataSource: z.string().min(1, "Please select a data source"),
    aggregation: z.enum(["count", "sum", "average"]),
    field: z.string().optional(), // Required if sum/avg
    goal: z.coerce.number().optional(),
    unit: z.string().min(1, "Unit is required"),
    category: z.string().min(1, "Category is required"),
});

type KPIFormValues = z.infer<typeof kpiSchema>;

interface KPIBuilderProps {
    onSave: (kpi: Omit<ImpactKPI, "id" | "value" | "trend">) => void;
    onCancel: () => void;
}

export function KPIBuilder({ onSave, onCancel }: KPIBuilderProps) {
    const form = useForm<KPIFormValues>({
        resolver: zodResolver(kpiSchema),
        defaultValues: {
            name: "",
            description: "",
            dataSource: "",
            aggregation: "count",
            field: "",
            unit: "",
            category: "General",
        },
    });

    const aggregation = form.watch("aggregation");

    const onSubmit = (data: KPIFormValues) => {
        onSave({
            ...data,
            trendPercentage: 0,
            formula: `${data.aggregation}(${data.dataSource}${data.field ? `.${data.field}` : ''})`
        });
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New KPI</CardTitle>
                <CardDescription>
                    Define a new key performance indicator based on your data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>KPI Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Volunteer Hours" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="General">General</SelectItem>
                                                    <SelectItem value="Programs">Programs</SelectItem>
                                                    <SelectItem value="Volunteers">Volunteers</SelectItem>
                                                    <SelectItem value="Financial">Financial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="What does this KPI measure?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                            <FormItem className="col-span-full">
                                <h4 className="font-semibold text-sm mb-2">Data Configuration</h4>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="dataSource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data Source</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select collection" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="crm_contacts">CRM Contacts</SelectItem>
                                                    <SelectItem value="events">Events</SelectItem>
                                                    <SelectItem value="shifts">Volunteer Shifts</SelectItem>
                                                    <SelectItem value="donations">Donations</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="aggregation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aggregation</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="count">Count Records</SelectItem>
                                                    <SelectItem value="sum">Sum of Field</SelectItem>
                                                    <SelectItem value="average">Average of Field</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(aggregation === 'sum' || aggregation === 'average') && (
                                <FormField
                                    control={form.control}
                                    name="field"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. amount, hours" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="goal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target / Goal (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Label</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Hours, $, People" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={onCancel} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Create KPI
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
