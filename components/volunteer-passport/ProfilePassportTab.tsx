"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, Fingerprint, FileCheck } from "lucide-react";

interface ProfilePassportTabProps {
    verificationStatus?: "verified" | "pending" | "unverified";
    vcssChecked?: boolean;
    identityVerified?: boolean;
}

/**
 * Displays the current passport status badge with appropriate accessibility labels.
 */
export function PassportStatusBadge({ status }: { status: "verified" | "pending" | "unverified" }) {
    if (status === "verified") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Verified Passport
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Pending Verification
        </Badge>
    );
}

/**
 * Component for Identity Verification status display.
 */
export function IdentityVerificationCard({ identityVerified }: { identityVerified: boolean }) {
    return (
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Fingerprint 
                className={`h-5 w-5 mt-0.5 ${identityVerified ? "text-green-600" : "text-gray-400"}`} 
                aria-hidden="true" 
            />
            <div>
                <p className="text-sm font-semibold">Identity Verification</p>
                <p className="text-xs text-muted-foreground">Government ID check and KYC.</p>
                <p className={`mt-2 text-xs font-bold ${identityVerified ? "text-green-600" : "text-orange-600"}`}>
                    {identityVerified ? "Status: Verified" : "Status: Actions Required"}
                </p>
            </div>
        </div>
    );
}

/**
 * Component for Safeguarding/VCSS status display.
 */
export function SafeguardingCard({ vcssChecked }: { vcssChecked: boolean }) {
    return (
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <ShieldAlert 
                className={`h-5 w-5 mt-0.5 ${vcssChecked ? "text-green-600" : "text-gray-400"}`} 
                aria-hidden="true" 
            />
            <div>
                <p className="text-sm font-semibold">Safeguarding Check (VCSS)</p>
                <p className="text-xs text-muted-foreground">Victorian Child Safe Standards compliance.</p>
                <p className={`mt-2 text-xs font-bold ${vcssChecked ? "text-green-600" : "text-orange-600"}`}>
                    {vcssChecked ? "Status: Compliant" : "Status: Review Pending"}
                </p>
            </div>
        </div>
    );
}

/**
 * Displays the list of active checks and endorsements.
 */
export function ActiveChecksPanel() {
    return (
        <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4" aria-hidden="true" />
                Active Checks
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• WWCC (Working with Children Check) - Verified 2025</li>
                <li>• National Police Check - Result: No Disclosable Outcomes</li>
                <li>• Organisation Endorsement: smalltalk.community</li>
            </ul>
        </div>
    );
}

/**
 * Privacy and Visibility configuration card.
 */
export function PrivacyVisibilityCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Privacy & Visibility</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                    Organisations you apply to can view your verification status. They cannot see your sensitive identity documents.
                </p>
                <Button variant="outline" size="sm" className="w-full">Manage Shared Credentials</Button>
            </CardContent>
        </Card>
    );
}

/**
 * Main Profile Passport Tab component.
 * Refactored to stay under 50 lines per function.
 */
export function ProfilePassportTab({
    verificationStatus = "unverified",
    vcssChecked = false,
    identityVerified = false
}: ProfilePassportTabProps) {
    return (
        <div className="space-y-6 max-w-full">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Digital Identity Passport</CardTitle>
                            <CardDescription>Your verified credentials and safeguarding status.</CardDescription>
                        </div>
                        <PassportStatusBadge status={verificationStatus} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <IdentityVerificationCard identityVerified={identityVerified} />
                        <SafeguardingCard vcssChecked={vcssChecked} />
                    </div>
                    <ActiveChecksPanel />
                </CardContent>
            </Card>
            <PrivacyVisibilityCard />
        </div>
    );
}