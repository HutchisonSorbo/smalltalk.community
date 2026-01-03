import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    Users,
    MapPin,
    Building2,
    Globe
} from "lucide-react";

export const metadata = {
    title: "About",
    description: "Learn about smalltalk.community - connecting Victorian communities through opportunities, skills, and meaningful connections.",
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    About smalltalk.community
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Connecting Victorian communities through opportunities, skills, and meaningful connections.
                </p>
            </div>

            {/* Mission */}
            <Card className="mb-12">
                <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        smalltalk.community is a platform designed to bring communities
                        together—connecting people with volunteering, music, learning,
                        work experience, and social opportunities all in one place.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                        Whether you&apos;re a young person looking for your first work experience,
                        a musician seeking gigs, a retiree wanting to volunteer, or an organisation
                        looking to reach your community—we&apos;re here to help you connect.
                    </p>
                </CardContent>
            </Card>

            {/* Council Partnership */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Working With Our Communities</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="font-bold">Mitchell Shire Council</h3>
                                    <Badge variant="secondary">Founding Partner</Badge>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Working together to connect Mitchell Shire residents with
                                local opportunities and services.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="font-bold">Murrindindi Shire Council</h3>
                                    <Badge variant="secondary">Partner</Badge>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Collaborating to extend community connections across
                                the Murrindindi region.
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <Card className="mt-6 bg-accent border-0">
                    <CardContent className="p-6 text-center">
                        <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                        <h3 className="font-bold mb-2">Victoria-Wide Expansion</h3>
                        <p className="text-sm text-muted-foreground">
                            We&apos;re actively working to expand smalltalk.community across
                            Victoria, partnering with councils and organisations throughout
                            the state to bring these tools to more communities.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Who We Serve */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Who We Serve</h2>
                <div className="grid gap-4">
                    {[
                        { age: "13-25", group: "Young People", desc: "Work experience, apprenticeships, skill building, and peer support" },
                        { age: "25-55", group: "Working Adults", desc: "Volunteering, professional networking, and community involvement" },
                        { age: "55+", group: "Seniors & Retirees", desc: "Volunteering, social connections, and sharing valuable skills" },
                        { age: "All ages", group: "Musicians & Creatives", desc: "Gigs, collaborations, and creative opportunities" },
                        { age: "All ages", group: "Organisations", desc: "Reach your community, post opportunities, find volunteers" },
                    ].map((item) => (
                        <div
                            key={item.group}
                            className="flex items-center gap-4 p-4 rounded-lg border"
                        >
                            <Badge variant="outline" className="w-20 justify-center">
                                {item.age}
                            </Badge>
                            <div>
                                <p className="font-medium">{item.group}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Values */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-2">Community-First</h3>
                            <p className="text-sm text-muted-foreground">
                                Built with and for our communities, shaped by your feedback
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-2">Inclusive</h3>
                            <p className="text-sm text-muted-foreground">
                                Welcoming all ages, backgrounds, abilities, and experience levels
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-2">Local Focus</h3>
                            <p className="text-sm text-muted-foreground">
                                Connecting you with opportunities in your own backyard
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Developer Credit */}
            <Card className="bg-muted/50 border-0">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-3">Development</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        smalltalk.community was developed by <strong>Ryan Hutchison</strong>,
                        a software developer based in regional Victoria, in partnership with
                        local councils and community organisations.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Have feedback or suggestions?{" "}
                        <a
                            href="mailto:hello@smalltalk.community"
                            className="text-primary hover:underline font-medium"
                            aria-label="Send feedback email to hello@smalltalk.community"
                        >
                            Email us at hello@smalltalk.community
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
