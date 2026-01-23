import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

export default async function IdentitySettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/settings/identity");
    }

    // Fetch current verification status (placeholder query logic)
    const { data: verification } = await supabase
        .from("identity_verifications")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                    Verify your identity to increase community trust and unlock restricted features.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                {!verification ? (
                    <Card className="border-yellow-200 bg-yellow-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                Not Verified
                            </CardTitle>
                            <CardDescription className="text-yellow-700/80">
                                You haven't verified your identity yet. Some features like premium marketplace listings or booking community spaces may be restricted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/settings/identity/verify">
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-sm">
                                    Start Verification Flow
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : verification.status === "verified" ? (
                    <Card className="border-green-200 bg-green-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-green-800">
                                <ShieldCheck className="h-4 w-4" />
                                Identity Verified
                            </CardTitle>
                            <CardDescription className="text-green-700/80">
                                Thank you for verifying your identity. Your account has full access to all community features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {verification.verifiedAt && (
                                <div className="text-sm text-green-700">
                                    Verified on: {new Date(verification.verifiedAt).toLocaleDateString()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Verification Pending
                            </CardTitle>
                            <CardDescription>
                                Our team is currently reviewing your documents. We'll notify you via email once completed.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Why verify?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>• Enhanced trust when messaging community members.</p>
                            <p>• Access to premium roles in selected organisations.</p>
                            <p>• Faster resolution for account recovery requests.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Privacy Commitment</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            We utilise industry-standard encryption to protect your data. Your identification documents are only used for verification and are never shared with third parties.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

