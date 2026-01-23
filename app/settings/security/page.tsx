import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Key, Smartphone, History } from "lucide-react";
import Link from "next/link";
import { MFASetup } from "./mfa-setup";
import { SessionsManager } from "./sessions-manager";
import { getMFAFactors } from "../actions";

export default async function SecuritySettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/settings/security");
    }

    const { factors } = await getMFAFactors();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account security and authentication methods.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Key className="h-4 w-4 text-primary" />
                            Password
                        </CardTitle>
                        <CardDescription>
                            Last changed recently. It is recommended to change your password regularly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <Link href="/reset-password">Change Password</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4 text-primary" />
                            Two-Factor Authentication (2FA)
                        </CardTitle>
                        <CardDescription>
                            Add an extra layer of security to your account by requiring more than just a password to log in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MFASetup initialFactors={factors} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <History className="h-4 w-4 text-primary" />
                            Active Sessions
                        </CardTitle>
                        <CardDescription>
                            Manage and logout from other devices where you are currently signed in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SessionsManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
