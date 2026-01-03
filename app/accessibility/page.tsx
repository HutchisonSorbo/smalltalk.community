import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Keyboard,
    Volume2,
    MousePointer2,
    Smartphone,
    MessageCircle,
    CheckCircle2,
} from "lucide-react";

// Update this date when accessibility content changes
const LAST_UPDATED = "January 4, 2026";

export const metadata = {
    title: "Accessibility Statement",
    description: "Our commitment to digital accessibility for all community members.",
};

export default function AccessibilityPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Accessibility Statement
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    smalltalk.community is committed to ensuring digital accessibility
                    for all community members, including people with disabilities.
                </p>
            </div>

            {/* Commitment */}
            <Card className="mb-8">
                <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        We are continually improving the user experience for everyone and
                        applying the relevant accessibility standards. We aim to conform
                        to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">WCAG 2.1 AA</Badge>
                        <Badge variant="outline">Screen Reader Compatible</Badge>
                        <Badge variant="outline">Keyboard Navigable</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Accessibility Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Keyboard className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Keyboard Navigation</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All interactive elements can be accessed using keyboard only.
                                        Use Tab to navigate, Enter to activate, and Escape to close dialogs.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Eye className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Visual Accessibility</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We use sufficient colour contrast ratios and clear typography.
                                        Dark mode is available for users who prefer reduced brightness.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Volume2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Screen Reader Support</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Our site is compatible with popular screen readers including
                                        NVDA, JAWS, and VoiceOver. All images include descriptive alt text.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <MousePointer2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Clear Focus Indicators</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Interactive elements have visible focus indicators to help
                                        keyboard users track their position on the page.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Smartphone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Mobile Accessible</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Our responsive design works on all devices. Touch targets
                                        are sized appropriately for mobile accessibility.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Reduced Motion</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Animations are reduced for users who have enabled
                                        &quot;Reduce motion&quot; in their operating system settings.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Contact Section */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-3">Feedback & Support</h2>
                            <p className="text-muted-foreground mb-4">
                                We welcome your feedback on the accessibility of smalltalk.community.
                                If you encounter any accessibility barriers or have suggestions for
                                improvement, please contact us:
                            </p>
                            <a
                                href="mailto:hello@smalltalk.community?subject=Accessibility%20Feedback"
                                className="text-primary hover:underline font-medium"
                            >
                                hello@smalltalk.community
                            </a>
                            <p className="text-sm text-muted-foreground mt-4">
                                We aim to respond to accessibility feedback within 5 business days.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Last Updated */}
            <p className="text-center text-sm text-muted-foreground mt-8">
                This statement was last updated on {LAST_UPDATED}.
            </p>
        </div>
    );
}
