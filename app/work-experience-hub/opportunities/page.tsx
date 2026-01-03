"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Clock,
    Building2,
    Calendar,
    Search,
    Filter,
    GraduationCap
} from "lucide-react";

// Demo placement data
const DEMO_PLACEMENTS = [
    {
        id: "1",
        title: "Veterinary Clinic Assistant",
        organisation: "Kilmore Veterinary Clinic",
        industry: "veterinary",
        location: "Kilmore",
        duration: "1 week",
        schedule: "Mon-Fri, 9am-3pm",
        ageRange: "13-18",
        description: "Shadow veterinarians and assist with animal care, reception duties, and learn about veterinary medicine.",
        requirements: ["Interest in animal care", "Reliable and punctual"],
        yearLevels: "Years 9-12",
    },
    {
        id: "2",
        title: "IT Support & Web Development",
        organisation: "Mitchell Shire Council",
        industry: "it",
        location: "Broadford",
        duration: "2 weeks",
        schedule: "Mon-Fri, 9am-4pm",
        ageRange: "15-24",
        description: "Work with the IT team on support tickets, website updates, and learn about local government technology infrastructure.",
        requirements: ["Basic computer skills", "Interest in technology"],
        yearLevels: "Years 10-12 or post-school",
    },
    {
        id: "3",
        title: "Early Childhood Education Assistant",
        organisation: "Little Stars Kindergarten",
        industry: "childcare",
        location: "Wallan",
        duration: "1 week",
        schedule: "Mon-Fri, 8:30am-3:30pm",
        ageRange: "16-24",
        description: "Support early childhood educators with activities, supervise play, and learn about child development.",
        requirements: ["Working with Children Check (can arrange)", "Patience and enthusiasm"],
        yearLevels: "Years 11-12 or post-school",
    },
    {
        id: "4",
        title: "Café & Hospitality Experience",
        organisation: "The Fig Tree Café",
        industry: "hospitality",
        location: "Seymour",
        duration: "1 week",
        schedule: "Varies (including weekends)",
        ageRange: "13-24",
        description: "Learn barista skills, food preparation, customer service, and kitchen operations in a busy café environment.",
        requirements: ["Friendly personality", "Available on weekends"],
        yearLevels: "Years 9-12 or post-school",
    },
    {
        id: "5",
        title: "Mechanical Workshop Placement",
        organisation: "Yea Auto Services",
        industry: "mechanical",
        location: "Yea",
        duration: "2 weeks",
        schedule: "Mon-Fri, 8am-4pm",
        ageRange: "14-24",
        description: "Hands-on experience with vehicle servicing, repairs, and workshop operations under qualified mechanics.",
        requirements: ["Interest in cars/mechanics", "Steel-capped boots required"],
        yearLevels: "Years 9-12 or post-school",
    },
    {
        id: "6",
        title: "Graphic Design & Marketing",
        organisation: "Creative Edge Studio",
        industry: "media",
        location: "Kilmore",
        duration: "1-2 weeks",
        schedule: "Mon-Thu, 10am-4pm",
        ageRange: "15-24",
        description: "Create designs for real clients, learn Adobe Creative Suite, and understand the marketing design process.",
        requirements: ["Basic design interest", "Portfolio helpful but not required"],
        yearLevels: "Years 10-12 or post-school",
    },
];

const INDUSTRIES = [
    { id: "all", name: "All Industries" },
    { id: "veterinary", name: "Animal Care & Veterinary" },
    { id: "it", name: "IT & Technology" },
    { id: "childcare", name: "Early Childhood" },
    { id: "hospitality", name: "Hospitality & Tourism" },
    { id: "mechanical", name: "Mechanical & Engineering" },
    { id: "media", name: "Media & Communications" },
    { id: "healthcare", name: "Healthcare & Aged Care" },
    { id: "retail", name: "Retail & Customer Service" },
    { id: "education", name: "Education" },
    { id: "construction", name: "Building & Construction" },
    { id: "agriculture", name: "Agriculture & Environment" },
    { id: "admin", name: "Office & Administration" },
    { id: "arts", name: "Arts & Creative Industries" },
    { id: "community", name: "Community Services" },
];

const DURATIONS = [
    { id: "all", name: "All Durations" },
    { id: "1-week", name: "1 week" },
    { id: "2-weeks", name: "2 weeks" },
    { id: "flexible", name: "Flexible" },
];

function OpportunitiesContent() {
    const searchParams = useSearchParams();
    const industryParam = searchParams.get("industry") || "all";

    const filteredPlacements = industryParam === "all"
        ? DEMO_PLACEMENTS
        : DEMO_PLACEMENTS.filter(p => p.industry === industryParam);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/work-experience-hub">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to industries
                </Link>
            </Button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        Work Experience Placements
                    </h1>
                    <p className="text-muted-foreground">
                        {filteredPlacements.length} placements available
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 bg-card p-4 rounded-lg border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9" />
                </div>
                <Select defaultValue={industryParam}>
                    <SelectTrigger>
                        <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                        {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind.id} value={ind.id}>
                                {ind.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select defaultValue="all">
                    <SelectTrigger>
                        <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {DURATIONS.map((dur) => (
                            <SelectItem key={dur.id} value={dur.id}>
                                {dur.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                </Button>
            </div>

            {/* Listings */}
            <div className="space-y-4">
                {filteredPlacements.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-lg text-muted-foreground">No placements found for this industry.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/work-experience-hub/opportunities">View all placements</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPlacements.map((placement) => (
                        <Card key={placement.id} className="hover:border-primary transition-all">
                            <CardContent className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{placement.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Building2 className="w-4 h-4" />
                                            {placement.organisation}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{placement.yearLevels}</Badge>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground mb-4">
                                    {placement.description}
                                </p>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Location</div>
                                        <div className="font-medium flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {placement.location}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Duration</div>
                                        <div className="font-medium flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {placement.duration}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Schedule</div>
                                        <div className="font-medium flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {placement.schedule}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Age Range</div>
                                        <div className="font-medium flex items-center gap-1">
                                            <GraduationCap className="w-4 h-4" />
                                            {placement.ageRange} years
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="mb-4">
                                    <p className="text-xs text-muted-foreground uppercase mb-2">Requirements</p>
                                    <div className="flex flex-wrap gap-2">
                                        {placement.requirements.map((req) => (
                                            <Badge key={req} variant="outline">{req}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button className="flex-1">Apply Now</Button>
                                    <Button variant="outline" className="flex-1">Learn More</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* No Results Note */}
            <Card className="mt-8 bg-accent border-0">
                <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">Can&apos;t find what you&apos;re looking for?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        We&apos;re always adding new placements. Check back soon or register for alerts.
                    </p>
                    <Button variant="outline">Get notified about new placements</Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OpportunitiesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading placements...</div>}>
            <OpportunitiesContent />
        </Suspense>
    );
}
