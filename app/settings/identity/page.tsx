import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

interface VerificationData {
    status: "pending" | "verified" | "unverified" | string;
    verified_at?: string;
    rejection_reason?: string;
}

function StatusCard({ verification }: { verification: VerificationData | null }) {
    if (!verification) {
        return (
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
                    <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-sm">
                        <Link href="/settings/identity/verify">Start Verification Flow</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (verification.status === "verified") {
        return (
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
                    {verification.verified_at && (
                        <div className="text-sm text-green-700">
                            Verified on: {new Date(verification.verified_at).toLocaleDateString()}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
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
    );
}

function InfoGrid() {
    return (
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
    );
}

export default async function IdentitySettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/settings/identity");

    let verification: VerificationData | null = null;
    try {
        const { data, error } = await supabase
            .from("identity_verifications")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error(`[IdentitySettingsPage] Query error for user ${user.id}:`, error);
        } else {
            verification = data;
        }
    } catch (err) {
        console.error(`[IdentitySettingsPage] Unexpected error for user ${user.id}:`, err);
    }

    return (
        <div className="space-y-6 max-w-full">
            <div>
                <h3 className="text-lg font-medium">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                    Verify your identity to increase community trust and unlock restricted features.
                </p>
            </div>
            <Separator />
            <div className="grid gap-6">
                <StatusCard verification={verification} />
                <InfoGrid />
            </div>
        </div>
    );
}

