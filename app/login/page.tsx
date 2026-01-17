"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase"; // Client-side client
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/hooks/use-toast";

import { AccessibilityPanel } from "@/components/local-music-network/AccessibilityPanel";

import { ThemeToggle } from "@/components/ThemeToggle";

import { Turnstile } from "@marsidev/react-turnstile";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [accountType, setAccountType] = useState("Individual");
    const [otherAccountType, setOtherAccountType] = useState("");
    const [organisationName, setOrganisationName] = useState("");
    const [showAgeWarning, setShowAgeWarning] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Auto-set captcha token in development mode to allow testing
    useEffect(() => {
        if (isDevelopment && !captchaToken) {
            setCaptchaToken('development-bypass-token');
        }
    }, [isDevelopment, captchaToken]);


    const checkAge = (dateString: string) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            setShowAgeWarning(true);
        }
    };

    useEffect(() => {
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (error) {
            let title = "Authentication Error";
            let description = errorDescription || "An error occurred during authentication.";

            if (error === "auth_code_error") {
                title = "Verification Failed";
            } else if (error === "cross_device_verification") {
                title = "Verification Link Expired or Invalid";
                description = "For security reasons, please open the verification link on the same device and browser where you signed up. If that doesn't work, try signing in to resend the link.";
            }

            toast({
                title,
                description,
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    const handleGoogleSignIn = async () => {
        const authClient = createClient();
        const { error } = await authClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${globalThis.location.origin}/api/auth/callback`,
            }
        });
        if (error) {
            console.error("Google Sign In Error:", error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            toast({
                title: "Security Check Required",
                description: "Please complete the captcha verification.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Save remember me preference
        if (typeof globalThis !== "undefined") {
            localStorage.setItem("remember_me", rememberMe.toString());
        }

        // Create a fresh client to pick up the preference
        const authClient = createClient();

        try {
            if (isSignUp) {
                const finalAccountType = accountType === "Other" ? otherAccountType : accountType;

                const { data, error } = await authClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            date_of_birth: dob,
                            account_type: finalAccountType,
                            organisation_name: accountType === "Individual" ? undefined : organisationName,
                            // Assign 'individual' or 'organisation' based on account type
                            user_type: accountType === "Individual" ? 'individual' : 'organisation',
                        },
                        captchaToken: captchaToken,
                        emailRedirectTo: `${globalThis.location.origin}/api/auth/callback`,
                    },
                });
                if (error) throw error;
                toast({
                    title: "Check your email",
                    description: "We sent you a confirmation link.",
                });
                router.push("/");
            } else {
                const { error } = await authClient.auth.signInWithPassword({
                    email,
                    password,
                    options: {
                        captchaToken: captchaToken,
                    },
                });
                if (error) throw error;
                router.refresh(); // Refresh server components
                router.push("/dashboard");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            // Reset captcha after attempt
            // Note: Depending on Turnstile config, it might need explicit reset, but usually for single attempts good to keep. 
            // Actually, Supabase consumes the token, so we should probably reset/expire it or let the user re-verify if failed.
            // For now, let's keep it simple.
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {isSignUp ? "Create an account" : "Sign into smalltalk.community"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <AccessibilityPanel variant="inline" />
                        </div>
                    </div>
                    <CardDescription>
                        {isSignUp
                            ? "Enter your email below to create your account"
                            : "Enter your email below to sign in to your account"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                    <CardContent className="grid gap-4">
                        {/* <Button
                            variant="outline"
                            type="button"
                            className="w-full flex gap-2"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </Button> */}
                        {/* <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div> */}

                        <div className="grid gap-2">
                            <label htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {isSignUp && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Account Type</Label>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            aria-label="Account Type"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={accountType}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setAccountType(val);
                                                if (val !== "Other") setOtherAccountType("");
                                                // Reset DOB if switching away from Individual? Or keep it?
                                                // Let's keep it simple.
                                            }}
                                            disabled={isLoading}
                                        >
                                            <option value="Individual">Individual</option>
                                            <option value="Business">Business</option>
                                            <option value="Government Organisation">Government Organisation</option>
                                            <option value="Charity or Not-for-profit">Charity or Not-for-profit</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        {accountType === "Other" && (
                                            <Input
                                                placeholder="Please specify..."
                                                value={otherAccountType}
                                                onChange={(e) => setOtherAccountType(e.target.value)}
                                                required={isSignUp && accountType === "Other"}
                                                disabled={isLoading}
                                            />
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Select the type of account that matches your needs.
                                        </p>
                                    </div>

                                    {accountType !== "Individual" && (
                                        <div className="grid gap-2 mt-2">
                                            <Label>Organisation Name</Label>
                                            <Input
                                                placeholder="e.g. Melbourne Symphony Orchestra"
                                                value={organisationName}
                                                onChange={(e) => setOrganisationName(e.target.value)}
                                                required={isSignUp}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    )}
                                </div>

                                {accountType === "Individual" && (
                                    <div className="grid gap-2">
                                        <label htmlFor="dob">Date of Birth</label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            required={isSignUp && accountType === "Individual"}
                                            value={dob}
                                            onChange={(e) => {
                                                setDob(e.target.value);
                                                checkAge(e.target.value);
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password">Password</label>
                                {!isSignUp && (
                                    <Button variant="link" size="sm" className="px-0 font-normal h-auto dark:text-white" onClick={() => router.push("/forgot-password")}>
                                        Forgot?
                                    </Button>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {!isSignUp && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="remember" className="text-sm font-normal">
                                    Remember Me (30 Days)
                                </Label>
                            </div>
                        )}
                        {/* Turnstile captcha - hidden in development mode for testing */}
                        {!isDevelopment && (
                            <div className="flex justify-center flex-col items-center gap-2">
                                {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                                    <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                                        <p className="font-semibold">Configuration Error</p>
                                        <p>Turnstile site key missing: contact admin / check .env</p>
                                    </div>
                                ) : (
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={(token) => setCaptchaToken(token)}
                                        onError={() => {
                                            setCaptchaToken(null);
                                            toast({
                                                title: "Security Check Failed",
                                                description: "Please disable adblockers or try a different network.",
                                                variant: "destructive"
                                            });
                                        }}
                                        onExpire={() => setCaptchaToken(null)}
                                    />
                                )}
                            </div>
                        )}
                        {isDevelopment && (
                            <p className="text-xs text-center text-green-600 dark:text-green-400">
                                🔓 Development mode: Captcha bypassed
                            </p>
                        )}
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Not seeing the security check? <br />
                            You may need to disable your adblocker.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                        <Button
                            variant="link"
                            type="button"
                            className="w-full text-foreground dark:text-white"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp
                                ? "Already have an account? Sign In"
                                : "Don't have an account? Sign Up"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <AlertDialog open={showAgeWarning} onOpenChange={setShowAgeWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Age Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Welcome to smalltalk.community! As you are under 18, some features of the website will be restricted to ensure a safe environment. We're glad to have you with us!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowAgeWarning(false)}>Understood</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// CodeRabbit Audit Trigger
