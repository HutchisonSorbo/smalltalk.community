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
import { toast } from "@/hooks/use-toast";
import { Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { enrollMFA, verifyMFAEnrollment, unenrollMFA } from "../actions";

interface MFASetupProps {
    initialFactors: any[];
}

export function MFASetup({ initialFactors }: MFASetupProps) {
    const [factors, setFactors] = useState(initialFactors);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"enroll" | "verify">("enroll");
    const [enrollData, setEnrollData] = useState<any>(null);
    const [otpCode, setOtpCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const activeFactor = factors.find((f) => f.status === "verified");

    const handleEnroll = async () => {
        setIsLoading(true);
        const result = await enrollMFA();
        setIsLoading(false);

        if (result.success) {
            setEnrollData(result.data);
            setStep("verify");
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to start MFA enrollment.",
                variant: "destructive",
            });
        }
    };

    const handleVerify = async () => {
        if (otpCode.length !== 6) return;

        setIsLoading(true);
        const result = await verifyMFAEnrollment(enrollData.id, otpCode);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: "2FA Enabled",
                description: "Your account is now protected with two-factor authentication.",
            });
            setIsOpen(false);
            setFactors([{ ...enrollData, status: "verified" }]);
            setStep("enroll");
            setOtpCode("");
        } else {
            toast({
                title: "Verification Failed",
                description: result.error || "The code you entered is invalid.",
                variant: "destructive",
            });
        }
    };

    const handleUnenroll = async () => {
        if (!activeFactor) return;

        if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
            return;
        }

        setIsLoading(true);
        const result = await unenrollMFA(activeFactor.id);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: "2FA Disabled",
                description: "Two-factor authentication has been removed from your account.",
            });
            setFactors([]);
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to disable 2FA.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-4">
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
                    <Button variant="outline" size="sm" onClick={handleUnenroll} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                                                render={({ slots }) => (
                                                    <InputOTPGroup>
                                                        {slots.map((slot, index) => (
                                                            <InputOTPSlot key={index} {...slot} index={index} />
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
