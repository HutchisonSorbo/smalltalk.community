"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AdminErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface AdminErrorBoundaryProps {
    children: React.ReactNode;
    fallbackTitle?: string;
}

/**
 * Error Boundary component for admin panel pages.
 * Catches runtime errors including connection failures and provides
 * a user-friendly error message with a retry option.
 */
export class AdminErrorBoundary extends React.Component<
    AdminErrorBoundaryProps,
    AdminErrorBoundaryState
> {
    constructor(props: AdminErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("[Admin Error Boundary] Caught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Force a page refresh to re-fetch data
        window.location.reload();
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            const { error } = this.state;
            const { fallbackTitle = "Something went wrong" } = this.props;

            // Check for common connection errors
            const isConnectionError = error?.message?.includes("Connection") ||
                error?.message?.includes("fetch") ||
                error?.message?.includes("network") ||
                error?.message?.includes("timeout");

            return (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {fallbackTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            {isConnectionError ? (
                                <>
                                    There was a connection error while loading this page.
                                    This is usually temporary and can be resolved by retrying.
                                </>
                            ) : (
                                <>
                                    An unexpected error occurred. Please try again or contact
                                    support if the problem persists.
                                </>
                            )}
                        </p>

                        {process.env.NODE_ENV === "development" && error && (
                            <div className="bg-muted p-3 rounded-lg">
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                    {error.message}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={this.handleRetry}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for use in server components.
 * Wraps children with the AdminErrorBoundary class component.
 */
export function AdminErrorBoundaryWrapper({
    children,
    fallbackTitle,
}: AdminErrorBoundaryProps) {
    return (
        <AdminErrorBoundary fallbackTitle={fallbackTitle}>
            {children}
        </AdminErrorBoundary>
    );
}
