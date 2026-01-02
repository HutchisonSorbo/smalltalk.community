"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Wrench,
    Stethoscope,
    Building2,
    Laptop,
    Truck,
    ChefHat,
    Palette,
    Leaf,
    Zap,
    ArrowRight
} from "lucide-react";

const INDUSTRIES = [
    { id: "construction", name: "Building & Construction", icon: Building2, count: 45 },
    { id: "automotive", name: "Automotive", icon: Truck, count: 23 },
    { id: "electrical", name: "Electrical", icon: Zap, count: 18 },
    { id: "healthcare", name: "Healthcare", icon: Stethoscope, count: 32 },
    { id: "it", name: "IT & Digital", icon: Laptop, count: 28 },
    { id: "hospitality", name: "Hospitality", icon: ChefHat, count: 41 },
    { id: "hairdressing", name: "Hairdressing & Beauty", icon: Palette, count: 15 },
    { id: "agriculture", name: "Agriculture", icon: Leaf, count: 12 },
    { id: "mechanical", name: "Mechanical & Engineering", icon: Wrench, count: 27 },
];

export default function ApprenticeshipHubPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Wrench className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                    Apprenticeships & Traineeships
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Earn while you learn! Find apprenticeships and traineeships
                    across Victoria with local employers.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">241</div>
                        <div className="text-sm text-muted-foreground">Live opportunities</div>
                    </div>
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">Free</div>
                        <div className="text-sm text-muted-foreground">TAFE courses</div>
                    </div>
                    <div className="bg-accent rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">15-24</div>
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
                            href={`/apprenticeship-hub/opportunities?industry=${industry.id}`}
                        >
                            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{industry.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {industry.count} opportunities
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
                    <Link href="/apprenticeship-hub/opportunities">
                        Browse All Opportunities
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Info Section */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-accent border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3">What&apos;s an apprenticeship?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            An apprenticeship combines paid on-the-job training with study
                            (usually at TAFE). Takes 3-4 years and leads to a trade qualification.
                            Great for hands-on learners!
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-accent border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-3">What&apos;s a traineeship?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A traineeship is similar but typically shorter (1-2 years) and
                            covers a wider range of industries. Perfect if you&apos;re exploring
                            different career paths.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
