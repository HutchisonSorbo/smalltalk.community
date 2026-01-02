"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Lock, MapPin, MessageCircle } from "lucide-react";

export default function PeerSupportFinderPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
            </div>

            {/* Hero */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                Find Peer Support Groups
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Connect with others who understand what you&apos;re going through.
                Find free, peer-led support groups in your area or online.
            </p>

            {/* Privacy Notice */}
            <Card className="bg-primary/5 border-2 border-primary mb-8 max-w-md mx-auto">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-2">
                        <Lock className="w-5 h-5" />
                        100% Anonymous
                    </div>
                    <p className="text-sm text-muted-foreground">
                        No login required. Your searches are never saved.
                    </p>
                </CardContent>
            </Card>

            {/* Main CTA */}
            <Button asChild size="lg" className="w-full max-w-xs mb-6">
                <Link href="/peer-support-finder/search">
                    <MapPin className="w-5 h-5 mr-2" />
                    Find groups near me
                </Link>
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-semibold mb-1">Peer-led</div>
                    <div className="text-xs text-muted-foreground">
                        Facilitated by people with lived experience
                    </div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-semibold mb-1">Safe spaces</div>
                    <div className="text-xs text-muted-foreground">
                        Confidential and judgement-free
                    </div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-semibold mb-1">Free</div>
                    <div className="text-xs text-muted-foreground">
                        No cost to attend any group
                    </div>
                </div>
            </div>

            {/* What is Peer Support */}
            <Card className="mt-12 text-left">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">What is peer support?</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Peer support groups are safe spaces where people with similar experiences
                        come together to share, listen, and support each other. They&apos;re not therapy—
                        they&apos;re about connection, understanding, and learning from others who &quot;get it.&quot;
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            No pressure to share—listen as much or as little as you want
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Meet others who truly understand your experience
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Learn practical coping strategies from real people
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
