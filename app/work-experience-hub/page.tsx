"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Briefcase,
    Stethoscope,
    Building2,
    Laptop,
    Truck,
    ChefHat,
    Palette,
    Leaf,
    Zap,
    ArrowRight,
    Store,
    GraduationCap,
    Hammer,
    Shield,
    Camera,
    Dog,
    Music,
    Baby,
    Heart,
    Wrench
} from "lucide-react";

const INDUSTRIES = [
    { id: "construction", name: "Building & Construction", icon: Hammer, count: 34 },
    { id: "automotive", name: "Automotive", icon: Truck, count: 18 },
    { id: "electrical", name: "Electrical & Trades", icon: Zap, count: 15 },
    { id: "healthcare", name: "Healthcare & Aged Care", icon: Stethoscope, count: 42 },
    { id: "it", name: "IT & Technology", icon: Laptop, count: 28 },
    { id: "hospitality", name: "Hospitality & Tourism", icon: ChefHat, count: 56 },
    { id: "hairdressing", name: "Hairdressing & Beauty", icon: Palette, count: 21 },
    { id: "agriculture", name: "Agriculture & Environment", icon: Leaf, count: 16 },
    { id: "retail", name: "Retail & Customer Service", icon: Store, count: 67 },
    { id: "education", name: "Education & Childcare", icon: GraduationCap, count: 29 },
    { id: "admin", name: "Office & Administration", icon: Building2, count: 38 },
    { id: "emergency", name: "Emergency Services", icon: Shield, count: 8 },
    { id: "media", name: "Media & Communications", icon: Camera, count: 14 },
    { id: "veterinary", name: "Animal Care & Veterinary", icon: Dog, count: 12 },
    { id: "arts", name: "Arts & Creative Industries", icon: Music, count: 19 },
    { id: "community", name: "Community Services", icon: Heart, count: 31 },
    { id: "childcare", name: "Early Childhood", icon: Baby, count: 24 },
    { id: "mechanical", name: "Mechanical & Engineering", icon: Wrench, count: 22 },
];

export default function WorkExperienceHubPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                    Work Experience Hub
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Explore careers through hands-on work experience! Find short-term
                    placements across Victoria to discover what you love.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">494</div>
                        <div className="text-sm text-muted-foreground">Placements available</div>
                    </div>
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">18</div>
                        <div className="text-sm text-muted-foreground">Industries</div>
                    </div>
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">13+</div>
                        <div className="text-sm text-muted-foreground">Years old</div>
                    </div>
                </div>
            </div>

            {/* Industry Selection */}
            <h2 className="text-2xl font-bold text-center mb-6">What industry interests you?</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {INDUSTRIES.map((industry) => {
                    const Icon = industry.icon;
                    return (
                        <Link
                            key={industry.id}
                            href={`/work-experience-hub/opportunities?industry=${industry.id}`}
                        >
                            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{industry.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {industry.count} placements
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Browse All Button */}
            <div className="text-center">
                <Button asChild size="lg">
                    <Link href="/work-experience-hub/opportunities">
                        Browse All Placements
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Info Section */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-accent border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3">What is work experience?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Work experience is a short-term placement (typically 1-2 weeks) where
                            you get hands-on exposure to a real workplace. It&apos;s a great way
                            to explore career options before committing to further study or training.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-accent border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3">Benefits of work experience</h3>
                        <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
                            <li>Discover what you enjoy (and don&apos;t!)</li>
                            <li>Build workplace skills and confidence</li>
                            <li>Make valuable industry connections</li>
                            <li>Strengthen your resume and applications</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Age Info */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3">Who can apply?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Work experience placements are available for anyone aged 13 and over.
                        Most placements are designed for secondary school students (Years 9-12),
                        but many employers also welcome post-school young people looking to
                        explore career options before committing to further study or employment.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
