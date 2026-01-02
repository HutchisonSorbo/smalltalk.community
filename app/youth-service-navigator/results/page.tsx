"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, ExternalLink, Heart, Clock, MapPin, DollarSign } from "lucide-react";

// Demo data for services
const DEMO_SERVICES = [
    {
        id: "headspace-geelong",
        name: "Headspace Geelong",
        type: "Youth Mental Health Service",
        phone: "03 5222 9600",
        website: "https://headspace.org.au/headspace-centres/geelong",
        address: "24 Gheringhap St, Geelong VIC 3220",
        waitTime: "2-3 weeks",
        cost: "Free",
        bulkBilled: true,
        ageRange: "12-25 years",
        services: ["Individual counselling", "Group programs", "Family support"],
        matchScore: 95,
        matchReason: "Good fit for anxiety support, ages 12-25, free services",
    },
    {
        id: "beyond-blue",
        name: "Beyond Blue Support Service",
        type: "National Mental Health Support",
        phone: "1300 22 4636",
        website: "https://beyondblue.org.au",
        address: "Phone & online support",
        waitTime: "Immediate",
        cost: "Free",
        bulkBilled: true,
        ageRange: "All ages",
        services: ["Phone counselling", "Online chat", "Email support"],
        matchScore: 88,
        matchReason: "Immediate access, free phone and online support",
    },
    {
        id: "youth-support-hub",
        name: "Youth Support Hub",
        type: "Community Youth Service",
        phone: "03 9999 8888",
        website: "https://example.com",
        address: "45 Main Street, Melbourne VIC 3000",
        waitTime: "1-2 weeks",
        cost: "Free",
        bulkBilled: true,
        ageRange: "15-25 years",
        services: ["Case management", "Housing support", "Education support"],
        matchScore: 82,
        matchReason: "Comprehensive youth support including wellbeing services",
    },
];

function ResultsContent() {
    const searchParams = useSearchParams();
    const urgency = searchParams.get("urgency");

    const showCrisisSupport = urgency === "crisis" || urgency === "urgent";

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/youth-service-navigator/intake">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change my answers
                </Link>
            </Button>

            {/* Header */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
                Support Options For You
            </h1>
            <p className="text-muted-foreground mb-8">
                Based on your answers, here are your best options
            </p>

            {/* Crisis Support Banner */}
            {showCrisisSupport && (
                <Card className="bg-destructive/5 border-2 border-destructive mb-8">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            🚨 If You Need Help Right Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            If you&apos;re in immediate danger, call <strong>000</strong>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-background border border-destructive rounded-lg p-4">
                                <h3 className="font-semibold mb-1">Lifeline</h3>
                                <p className="text-2xl font-bold text-destructive mb-1">13 11 14</p>
                                <p className="text-sm text-muted-foreground mb-3">24/7 crisis support</p>
                                <Button asChild variant="destructive" size="sm" className="w-full">
                                    <a href="tel:131114">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call now
                                    </a>
                                </Button>
                            </div>
                            <div className="bg-background border border-destructive rounded-lg p-4">
                                <h3 className="font-semibold mb-1">Kids Helpline</h3>
                                <p className="text-2xl font-bold text-destructive mb-1">1800 55 1800</p>
                                <p className="text-sm text-muted-foreground mb-3">5-25 years, 24/7</p>
                                <Button asChild variant="destructive" size="sm" className="w-full">
                                    <a href="tel:1800551800">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call now
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Best Matches */}
            <h2 className="text-xl font-semibold mb-4">Your Best Matches</h2>
            <div className="space-y-4 mb-8">
                {DEMO_SERVICES.map((service, index) => (
                    <Card key={service.id} className={index === 0 ? "border-2 border-primary" : ""}>
                        <CardContent className="p-6">
                            {/* Top Match Badge */}
                            {index === 0 && (
                                <Badge className="bg-primary text-white mb-4">
                                    ⭐ TOP MATCH
                                </Badge>
                            )}

                            {/* Service Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground">{service.type}</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Heart className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                            </div>

                            {/* Match Reason */}
                            <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-md mb-4">
                                <p className="text-sm">
                                    <strong>Why this matches:</strong> {service.matchReason}
                                </p>
                            </div>

                            {/* Key Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Wait Time</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {service.waitTime}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Cost</div>
                                    <div className="font-medium text-green-600 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {service.cost}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Age Range</div>
                                    <div className="font-medium">{service.ageRange}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">Location</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Nearby
                                    </div>
                                </div>
                            </div>

                            {/* Services Offered */}
                            <div className="mb-4">
                                <p className="text-sm font-medium mb-2">What they offer:</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {service.services.map((s) => (
                                        <li key={s}>{s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button asChild className="flex-1">
                                    <a href={`tel:${service.phone.replace(/\s/g, "")}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call {service.phone}
                                    </a>
                                </Button>
                                <Button variant="outline" asChild className="flex-1">
                                    <a href={service.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Visit website
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Feedback */}
            <Card className="bg-accent">
                <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">Was this helpful?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your feedback helps us improve this tool
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline">👍 Yes</Button>
                        <Button variant="outline">👎 No</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
