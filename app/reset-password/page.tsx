"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibilityPanel } from "@/components/local-music-network/AccessibilityPanel";
import { z } from "zod";

// Strict password schema
const passwordSchema = z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces");

const formSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Validate form
        const result = formSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            const formattedErrors: { password?: string; confirmPassword?: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0] === "password") formattedErrors.password = err.message;
                if (err.path[0] === "confirmPassword") formattedErrors.confirmPassword = err.message;
            });
            setFieldErrors(formattedErrors);
            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                setError(error.message);
            } else {
                setIsSubmitted(true);
                // Optionally redirect after a delay
                setTimeout(() => {
                    router.push("/login?message=Password updated successfully");
                }, 3000);
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
                        <CardTitle className="text-2xl font-bold">Password Updated</CardTitle>
                        <CardDescription>
                            Your password has been successfully reset. You will be redirected to the login page shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/login">
                            <Button className="w-full">
                                Go to Sign In
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
                        <div className="flex items-center gap-2 mb-2">
                            {/* Placeholder for alignment if needed */}
                        </div>
                        <div className="flex items-center gap-2 w-full justify-end">
                            <ThemeToggle />
                            <AccessibilityPanel variant="inline" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                New Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null);
                                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                                disabled={isLoading}
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                            />
                            {fieldErrors.password && (
                                <p id="password-error" className="text-sm font-medium text-destructive">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                }}
                                disabled={isLoading}
                                aria-invalid={!!fieldErrors.confirmPassword}
                                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                            />
                            {fieldErrors.confirmPassword && (
                                <p id="confirmPassword-error" className="text-sm font-medium text-destructive">
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>
                        {error && (
                            <div className="text-sm font-medium text-destructive text-center">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
