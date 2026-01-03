"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    MapPin,
    Clock,
    Users,
    Calendar,
    Heart,
    Filter
} from "lucide-react";

// Demo data for support groups
const DEMO_GROUPS = [
    {
        id: "anxiety-geelong",
        name: "Young Adults Anxiety Support Group",
        organiser: "Beyond Blue",
        type: "peer-support",
        topics: ["anxiety", "stress"],
        ageRange: "18-30",
        format: "face-to-face",
        location: "Geelong",
        distance: "8km",
        meetingTime: "Thursdays, 6:00pm",
        frequency: "Weekly",
        nextMeeting: "Thursday, 9 January 2025",
        cost: "Free",
        community: null,
        tags: ["Peer-led", "Free", "Drop-in welcome"],
    },
    {
        id: "lgbtiq-melbourne",
        name: "Rainbow Minds Support Circle",
        organiser: "QLife",
        type: "peer-support",
        topics: ["general", "identity"],
        ageRange: "16-25",
        format: "face-to-face",
        location: "Melbourne CBD",
        distance: "15km",
        meetingTime: "Wednesdays, 5:30pm",
        frequency: "Fortnightly",
        nextMeeting: "Wednesday, 15 January 2025",
        cost: "Free",
        community: "LGBTIQ+",
        tags: ["LGBTIQ+", "Peer-led", "Free"],
    },
    {
        id: "grief-online",
        name: "Young People's Grief Circle",
        organiser: "Grief Line",
        type: "facilitated",
        topics: ["grief"],
        ageRange: "13-25",
        format: "online",
        location: "Online (Zoom)",
        distance: null,
        meetingTime: "Tuesdays, 7:00pm",
        frequency: "Weekly",
        nextMeeting: "Tuesday, 14 January 2025",
        cost: "Free",
        community: null,
        tags: ["Online", "Peer-led", "Free"],
    },
    {
        id: "depression-ballarat",
        name: "Blue Days Support Group",
        organiser: "Ballarat Health",
        type: "peer-support",
        topics: ["depression"],
        ageRange: "18-35",
        format: "face-to-face",
        location: "Ballarat",
        distance: "85km",
        meetingTime: "Saturdays, 10:00am",
        frequency: "Weekly",
        nextMeeting: "Saturday, 11 January 2025",
        cost: "Free",
        community: null,
        tags: ["Peer-led", "Free", "Morning session"],
    },
];

function ResultsContent() {
    const searchParams = useSearchParams();
    const location = searchParams.get("location") || "";

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/peer-support-finder/search">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change filters
                </Link>
            </Button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        Support Groups {location && `near ${location}`}
                    </h1>
                    <p className="text-muted-foreground">
                        {DEMO_GROUPS.length} groups found
                    </p>
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {DEMO_GROUPS.map((group) => (
                    <Card key={group.id} className="hover:border-primary transition-all">
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                            variant="secondary"
                                            className="bg-green-100 text-green-700"
                                        >
                                            ✓ Currently Meeting
                                        </Badge>
                                        {group.community && (
                                            <Badge variant="outline">{group.community}</Badge>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold">{group.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Facilitated by {group.organiser}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Heart className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">
                                        When
                                    </div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {group.meetingTime}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">
                                        Where
                                    </div>
                                    <div className="font-medium flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {group.location}
                                        {group.distance && (
                                            <span className="text-muted-foreground text-sm">
                                                ({group.distance})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">
                                        Age Range
                                    </div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {group.ageRange} years
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase mb-1">
                                        Cost
                                    </div>
                                    <div className="font-medium text-green-600">
                                        {group.cost}
                                    </div>
                                </div>
                            </div>

                            {/* Next Meeting */}
                            <div className="bg-accent rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">Next meeting:</span>
                                    <span>{group.nextMeeting}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {group.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button className="flex-1">View details</Button>
                                <Button variant="outline" className="flex-1">
                                    Get contact info
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results Note */}
            <Card className="mt-8 bg-accent">
                <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">Can&apos;t find what you&apos;re looking for?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or searching in a different area.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/peer-support-finder/search">
                            Update my search
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading groups...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
