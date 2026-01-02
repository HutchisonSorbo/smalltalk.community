"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import Link from "next/link";

const TOPIC_OPTIONS = [
    { value: "anxiety", label: "Anxiety" },
    { value: "depression", label: "Depression" },
    { value: "grief", label: "Grief & Loss" },
    { value: "trauma", label: "Trauma" },
    { value: "addiction", label: "Addiction & Recovery" },
    { value: "eating", label: "Eating Difficulties" },
    { value: "stress", label: "Stress & Burnout" },
    { value: "general", label: "General Mental Health" },
];

const COMMUNITY_OPTIONS = [
    { value: "any", label: "Open to all" },
    { value: "lgbtiq", label: "LGBTIQ+" },
    { value: "women", label: "Women only" },
    { value: "men", label: "Men only" },
    { value: "young-parents", label: "Young parents" },
    { value: "cald", label: "Culturally diverse" },
    { value: "aboriginal", label: "Aboriginal & Torres Strait Islander" },
];

const FORMAT_OPTIONS = [
    { value: "any", label: "Any format" },
    { value: "face-to-face", label: "Face-to-face only" },
    { value: "online", label: "Online only" },
];

export default function SearchPage() {
    const router = useRouter();

    const [filters, setFilters] = useState({
        location: "",
        topics: [] as string[],
        community: "any",
        format: "any",
    });

    const toggleTopic = (topic: string) => {
        setFilters((prev) => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter((t) => t !== topic)
                : [...prev.topics, topic],
        }));
    };

    const handleSearch = () => {
        const params = new URLSearchParams({
            location: filters.location,
            topics: filters.topics.join(","),
            community: filters.community,
            format: filters.format,
        });
        router.push(`/peer-support-finder/results?${params.toString()}`);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/peer-support-finder">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Link>
            </Button>

            {/* Header */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
                Find Support Groups
            </h1>
            <p className="text-muted-foreground mb-8">
                Filter to find groups that match your needs
            </p>

            {/* Filters */}
            <div className="space-y-6">
                {/* Location */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="location" className="sr-only">
                            Suburb or postcode
                        </Label>
                        <Input
                            id="location"
                            type="text"
                            placeholder="Enter suburb or postcode"
                            value={filters.location}
                            onChange={(e) =>
                                setFilters({ ...filters, location: e.target.value })
                            }
                        />
                        <Button variant="outline" className="w-full mt-3" type="button">
                            <MapPin className="w-4 h-4 mr-2" />
                            Use my current location
                        </Button>
                    </CardContent>
                </Card>

                {/* Topics */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Topics</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            What would you like support with?
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {TOPIC_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${filters.topics.includes(option.value)
                                            ? "border-primary bg-primary/5"
                                            : "border-secondary hover:border-primary/50"
                                        }`}
                                >
                                    <Checkbox
                                        checked={filters.topics.includes(option.value)}
                                        onCheckedChange={() => toggleTopic(option.value)}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Community */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Community</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Looking for a specific community?
                        </p>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={filters.community}
                            onValueChange={(value) =>
                                setFilters({ ...filters, community: value })
                            }
                            className="grid grid-cols-2 gap-3"
                        >
                            {COMMUNITY_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${filters.community === option.value
                                            ? "border-primary bg-primary/5"
                                            : "border-secondary hover:border-primary/50"
                                        }`}
                                >
                                    <RadioGroupItem
                                        value={option.value}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Format */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Format</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={filters.format}
                            onValueChange={(value) =>
                                setFilters({ ...filters, format: value })
                            }
                            className="flex flex-wrap gap-3"
                        >
                            {FORMAT_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${filters.format === option.value
                                            ? "border-primary bg-primary/5"
                                            : "border-secondary hover:border-primary/50"
                                        }`}
                                >
                                    <RadioGroupItem
                                        value={option.value}
                                        className="mr-3"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Search Button */}
                <Button onClick={handleSearch} size="lg" className="w-full">
                    <Search className="w-5 h-5 mr-2" />
                    Search for groups
                </Button>
            </div>
        </div>
    );
}
