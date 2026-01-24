"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { enrollMFA, verifyMFAEnrollment, unenrollMFA } from "../actions";

interface MFAFactor {
    id: string;
    status: "verified" | "unverified";
    friendly_name?: string;
    factor_type: string;
    created_at: string;
    updated_at: string;
}

interface EnrollData {
    id: string;
    type: "totp";
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

interface MFASetupProps {
    initialFactors: MFAFactor[];
}

export function MFASetup({ initialFactors }: MFASetupProps) {
    const [factors, setFactors] = useState<MFAFactor[]>(initialFactors);
    const [isOpen, setIsOpen] = useState(false);
    const [isUnenrollOpen, setIsUnenrollOpen] = useState(false);
    const [step, setStep] = useState<"enroll" | "verify">("enroll");
    const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const activeFactor = factors.find((f) => f.status === "verified");

    const handleEnroll = async () => {
        setIsLoading(true);
        try {
            const result = await enrollMFA();
            if (result.success) {
                setEnrollData(result.data as EnrollData);
                setStep("verify");
            } else {
                console.error("[handleEnroll] Enrollment error:", result.error);
                toast({
                    title: "Security Error",
                    description: "Unable to start MFA enrollment at this time.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("[handleEnroll] Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        const sanitizedOtp = otpCode.replace(/\D/g, "");
        if (sanitizedOtp.length !== 6) {
            toast({
                title: "Invalid Code",
                description: "Please enter a 6-digit verification code.",
                variant: "destructive",
            });
            return;
        }

        if (!enrollData) return;

        setIsLoading(true);
        try {
            const result = await verifyMFAEnrollment(enrollData.id, sanitizedOtp);
            if (result.success) {
                toast({
                    title: "2FA Enabled",
                    description: "Your account is now protected with two-factor authentication.",
                });
                setIsOpen(false);
                setFactors([{ ...enrollData, status: "verified", factor_type: 'totp', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
                setStep("enroll");
                setOtpCode("");
            } else {
                console.error("[handleVerify] Verification error:", result.error);
                toast({
                    title: "Verification Failed",
                    description: "The code you entered is invalid or has expired.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("[handleVerify] Unexpected error:", error);
            toast({
                title: "Error",
                description: "Failed to verify code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnenroll = async () => {
        if (!activeFactor) return;

        setIsLoading(true);
        try {
            const result = await unenrollMFA(activeFactor.id);
            if (result.success) {
                toast({
                    title: "2FA Disabled",
                    description: "Two-factor authentication has been removed from your account.",
                });
                setFactors([]);
                setIsUnenrollOpen(false);
            } else {
                console.error("[handleUnenroll] Unenroll error:", result.error);
                toast({
                    title: "Error",
                    description: "Unable to disable two-factor authentication.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("[handleUnenroll] Unexpected error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while disabling 2FA.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // In handleUnenroll component JSX, search for the button:

    return (
        <div className="space-y-4 max-w-full">
            <AlertDialog open={isUnenrollOpen} onOpenChange={setIsUnenrollOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will make your account less secure. You will no longer be prompted for a verification code when signing in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleUnenroll();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Disable 2FA
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {activeFactor ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                        Status: {activeFactor ? "Enabled" : "Disabled"}
                    </span>
                </div>
                {activeFactor ? (
                    <Button variant="outline" size="sm" onClick={() => setIsUnenrollOpen(true)} disabled={isLoading}>
                        Disable 2FA
                    </Button>
                ) : (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>Enable 2FA</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                                <DialogDescription>
                                    Add an extra layer of security using an authenticator app.
                                </DialogDescription>
                            </DialogHeader>

                            {step === "enroll" ? (
                                <div className="flex flex-col items-center py-6 space-y-4">
                                    <Smartphone className="h-12 w-12 text-primary" />
                                    <p className="text-center text-sm text-muted-foreground">
                                        Click the button below to generate your authentication key.
                                    </p>
                                    <Button onClick={handleEnroll} disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Get Started
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">1. Scan QR Code or enter secret</p>
                                        <div className="p-4 bg-muted rounded-md break-all">
                                            <p className="text-xs font-mono select-all">{enrollData?.totp?.secret}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Use an app like Google Authenticator or Authy to scan or enter the secret above.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">2. Enter verification code</p>
                                        <div className="flex justify-center">
                                            <InputOTP
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={setOtpCode}
                                                id="mfa-otp-input"
                                                render={({ slots }) => (
                                                    <InputOTPGroup>
                                                        {slots.map((slot, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                {...slot}
                                                                index={index}
                                                                aria-label={`Digit ${index + 1}`}
                                                                inputMode="numeric"
                                                            />
                                                        ))}
                                                    </InputOTPGroup>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                {step === "verify" && (
                                    <Button
                                        onClick={handleVerify}
                                        disabled={otpCode.length !== 6 || isLoading}
                                        className="w-full"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Verify and Enable
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
