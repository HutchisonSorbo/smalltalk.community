"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    MapPin,
    DollarSign,
    Clock,
    Building2,
    GraduationCap,
    Search,
    Star
} from "lucide-react";

// Demo data for opportunities
const DEMO_OPPORTUNITIES = [
    {
        id: "plumbing-geelong",
        title: "Plumbing Apprenticeship",
        employer: "Geelong Plumbing Co",
        type: "Apprenticeship",
        industry: "Building & Construction",
        location: "Geelong",
        duration: "4 years",
        wageYear1: "$18,000 - $22,000",
        qualification: "Certificate III in Plumbing",
        status: "Accepting applications",
        featured: true,
        tags: ["Full-time", "Free TAFE", "Tool allowance"],
        postedDate: "2 days ago",
    },
    {
        id: "automotive-ballarat",
        title: "Automotive Mechanic Apprenticeship",
        employer: "Smith's Auto Centre",
        type: "Apprenticeship",
        industry: "Automotive",
        location: "Ballarat",
        duration: "3.5 years",
        wageYear1: "$17,500 - $21,000",
        qualification: "Certificate III in Light Vehicle Mechanical Technology",
        status: "Accepting applications",
        featured: false,
        tags: ["Full-time", "Free TAFE"],
        postedDate: "1 week ago",
    },
    {
        id: "hospitality-melbourne",
        title: "Commercial Cookery Apprenticeship",
        employer: "The Grand Melbourne Hotel",
        type: "Apprenticeship",
        industry: "Hospitality",
        location: "Melbourne CBD",
        duration: "3 years",
        wageYear1: "$19,000 - $23,000",
        qualification: "Certificate III in Commercial Cookery",
        status: "Closing soon",
        featured: false,
        tags: ["Full-time", "Meals included", "Career pathway"],
        postedDate: "3 days ago",
    },
    {
        id: "it-traineeship",
        title: "IT Support Traineeship",
        employer: "Tech Solutions Victoria",
        type: "Traineeship",
        industry: "IT & Digital",
        location: "Remote / Melbourne",
        duration: "1 year",
        wageYear1: "$24,000 - $28,000",
        qualification: "Certificate IV in Information Technology",
        status: "Accepting applications",
        featured: false,
        tags: ["Full-time", "Work from home", "Free laptop"],
        postedDate: "5 days ago",
    },
    {
        id: "hairdressing-bendigo",
        title: "Hairdressing Apprenticeship",
        employer: "Luxe Hair Studio",
        type: "Apprenticeship",
        industry: "Hairdressing & Beauty",
        location: "Bendigo",
        duration: "3 years",
        wageYear1: "$16,500 - $19,000",
        qualification: "Certificate III in Hairdressing",
        status: "Accepting applications",
        featured: false,
        tags: ["Full-time", "Product discounts", "Mentorship"],
        postedDate: "1 week ago",
    },
];

function OpportunitiesContent() {
    const searchParams = useSearchParams();
    const industryFilter = searchParams.get("industry");

    // Filter opportunities (in real implementation, this would be API-based)
    const opportunities = industryFilter
        ? DEMO_OPPORTUNITIES.filter(
            (o) => o.industry.toLowerCase().includes(industryFilter.replace("-", " "))
        )
        : DEMO_OPPORTUNITIES;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/apprenticeship-hub">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to industries
                </Link>
            </Button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        {industryFilter
                            ? `${industryFilter.replace("-", " & ").charAt(0).toUpperCase() + industryFilter.replace("-", " & ").slice(1)} Opportunities`
                            : "All Opportunities"}
                    </h1>
                    <p className="text-muted-foreground">
                        {opportunities.length} opportunities available
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search opportunities..."
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                    Apprenticeships
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                    Traineeships
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                    Near me
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                    Free TAFE
                </Badge>
            </div>

            {/* Opportunity Cards */}
            <div className="space-y-4">
                {opportunities.map((opportunity) => (
                    <Card
                        key={opportunity.id}
                        className={`hover:border-primary transition-all ${opportunity.featured ? "border-2 border-primary bg-primary/5" : ""
                            }`}
                    >
                        <CardContent className="p-6">
                            {/* Featured Badge */}
                            {opportunity.featured && (
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium text-primary">
                                        Featured Opportunity
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                {/* Left: Details */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1">{opportunity.title}</h3>
                                    <p className="text-muted-foreground mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        {opportunity.employer}
                                    </p>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">
                                                Location
                                            </div>
                                            <div className="font-medium flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {opportunity.location}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">
                                                Year 1 Wage
                                            </div>
                                            <div className="font-medium text-green-600 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {opportunity.wageYear1}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">
                                                Duration
                                            </div>
                                            <div className="font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {opportunity.duration}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase">
                                                Qualification
                                            </div>
                                            <div className="font-medium flex items-center gap-1">
                                                <GraduationCap className="w-3 h-3" />
                                                <span className="truncate">{opportunity.qualification.split(" in ")[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">{opportunity.type}</Badge>
                                        {opportunity.tags.map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Status & Action */}
                                <div className="flex flex-col justify-between items-end">
                                    <div className="text-right mb-4">
                                        <Badge
                                            variant={
                                                opportunity.status === "Closing soon"
                                                    ? "destructive"
                                                    : "default"
                                            }
                                            className="mb-2"
                                        >
                                            {opportunity.status}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                            Posted {opportunity.postedDate}
                                        </p>
                                    </div>
                                    <Button>View Details</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
                <Button variant="outline">Load more opportunities</Button>
            </div>
        </div>
    );
}

export default function OpportunitiesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading opportunities...</div>}>
            <OpportunitiesContent />
        </Suspense>
    );
}
