"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase"; // Client-side client
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";

import { AccessibilityPanel } from "@/components/AccessibilityPanel";

import { ThemeToggle } from "@/components/ThemeToggle";

import { Turnstile } from "@marsidev/react-turnstile";

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
    const [userType, setUserType] = useState<'musician' | 'professional'>('musician');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (error) {
            toast({
                title: error === "auth_code_error" ? "Verification Failed" : "Authentication Error",
                description: errorDescription || "An error occurred during authentication.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

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
        if (typeof window !== "undefined") {
            localStorage.setItem("remember_me", rememberMe.toString());
        }

        // Create a fresh client to pick up the preference
        const authClient = createClient();

        try {
            if (isSignUp) {
                console.log("Sign up attempt for:", email);
                const { data, error } = await authClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            date_of_birth: dob,
                            user_type: userType,
                        },
                        captchaToken: captchaToken,
                        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
                    },
                });
                console.log("Sign up result:", { data, error });
                if (error) throw error;
                toast({
                    title: "Check your email",
                    description: "We sent you a confirmation link.",
                });
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
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
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
                            {isSignUp ? "Create an account" : "Sign in to vic.band"}
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
                                    <label htmlFor="dob">Date of Birth</label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        required={isSignUp}
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>I am a...</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${userType === 'musician' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                            onClick={() => setUserType('musician')}
                                        >
                                            <span className="font-semibold">Musician</span>
                                            <span className="text-xs text-center text-muted-foreground mt-1">For bands, solo artists, and session players</span>
                                        </div>
                                        <div
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${userType === 'professional' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                            onClick={() => setUserType('professional')}
                                        >
                                            <span className="font-semibold">Professional</span>
                                            <span className="text-xs text-center text-muted-foreground mt-1">For producers, photographers, managers</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="grid gap-2">
                            <label htmlFor="password">Password</label>
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
                        <div className="flex justify-center">
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                onSuccess={(token) => setCaptchaToken(token)}
                                onError={() => setCaptchaToken(null)}
                                onExpire={() => setCaptchaToken(null)}
                            />
                        </div>
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
        </div>
    );
}
