"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibilityPanel } from "@/components/local-music-network/AccessibilityPanel";
import { z } from "zod";

import { Turnstile } from "@marsidev/react-turnstile";

const emailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate email
        const result = emailSchema.safeParse(email);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        if (!captchaToken) {
            setError("Please complete the captcha verification");
            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
                captchaToken,
            });

            if (error) {
                // Rate limit error specifically
                if (error.status === 429) {
                    setError("Too many requests. Please try again later.");
                } else {
                    setError(error.message);
                }
            } else {
                setIsSubmitted(true);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500" role="img" aria-label="Success" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                        <CardDescription>
                            We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/login">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <AccessibilityPanel variant="inline" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight mt-4">Forgot password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError(null);
                                }}
                                disabled={isLoading}
                                aria-invalid={!!error}
                                aria-describedby={error ? "email-error" : undefined}
                            />
                            {error && (
                                <p id="email-error" className="text-sm font-medium text-destructive">
                                    {error}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-center">
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                                onSuccess={setCaptchaToken}
                                onError={() => setError("Captcha verification failed.")}
                                onExpire={() => setCaptchaToken(null)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading || !captchaToken}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
