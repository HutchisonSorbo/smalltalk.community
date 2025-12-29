"use client";


import {
    User,
    Building2,
    Landmark,
    Heart,
    HeartHandshake,
    GraduationCap,
    Users,
    HelpCircle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AccountType =
    | "Individual"
    | "Business"
    | "Government Organisation"
    | "Charity"
    | "Not-for-Profit"
    | "Education Institution"
    | "Community Group"
    | "Other";

interface AccountTypeSelectorProps {
    selectedType: AccountType | null;
    specification: string;
    onSelect: (type: AccountType) => void;
    onSpecify: (spec: string) => void;
}

const accountTypes: { id: AccountType; label: string; icon: any; description: string }[] = [
    {
        id: "Individual",
        label: "Individual",
        icon: User,
        description: "Musicians, artists, gig-goers, and freelancers."
    },
    {
        id: "Business",
        label: "Business",
        icon: Building2,
        description: "Commercial entities, venues, and suppliers."
    },
    {
        id: "Government Organisation",
        label: "Government",
        icon: Landmark,
        description: "Local councils and government bodies."
    },
    {
        id: "Charity",
        label: "Charity",
        icon: Heart,
        description: "Registered charitable organisations."
    },
    {
        id: "Not-for-Profit",
        label: "Not-for-Profit",
        icon: HeartHandshake,
        description: "Non-profit organisations and social enterprises."
    },
    {
        id: "Education Institution",
        label: "Education",
        icon: GraduationCap,
        description: "Schools, universities, and training providers."
    },
    {
        id: "Community Group",
        label: "Community Groups",
        icon: Users,
        description: "Local clubs, associations, and collectives."
    },
    {
        id: "Other",
        label: "Other",
        icon: HelpCircle,
        description: "Any other type of organisation."
    },
];

export function AccountTypeSelector({ selectedType, specification, onSelect, onSpecify }: AccountTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {accountTypes.map((type) => {
                    const isSelected = selectedType === type.id;
                    const Icon = type.icon;

                    return (
                        <div
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={cn(
                                "relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border bg-card hover:border-primary/50"
                            )}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect(type.id);
                                }
                            }}
                        >
                            <div className="flex w-full justify-between mb-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                )}
                            </div>

                            <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {type.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {selectedType === "Other" && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Label htmlFor="specification" className="mb-2 block text-sm font-medium">
                        Please specify your organisation type
                    </Label>
                    <Input
                        id="specification"
                        placeholder="e.g. Social Club, Research Group..."
                        value={specification}
                        onChange={(e) => onSpecify(e.target.value)}
                        className="max-w-md bg-background"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}
