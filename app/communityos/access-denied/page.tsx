/**
 * CommunityOS Access Denied Page
 * Displayed when a user doesn't have access to a tenant
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";

interface AccessDeniedPageProps {
    searchParams: Promise<{ tenant?: string }>;
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
    const { tenant } = await searchParams;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-xl">Access Denied</CardTitle>
                    <CardDescription>
                        You don&apos;t have access to this organisation
                        {tenant && <span className="font-medium"> ({tenant})</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        To access this organisation&apos;s CommunityOS workspace, you need to be added as a member by an administrator.
                    </p>

                    <div className="flex flex-col gap-2">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to My Dashboard
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="w-full">
                            <a href="mailto:ryanhutchison@outlook.com.au?subject=CommunityOS%20Access%20Request">
                                <Mail className="mr-2 h-4 w-4" />
                                Request Access
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
