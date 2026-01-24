import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";


export default async function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Overview</h3>
                <p className="text-sm text-muted-foreground">
                    Your account overview and quick links.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card id="profile" className="hover:border-primary/50 transition-colors scroll-mt-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Update your personal information and profile details.
                        </p>
                        <Link href="/dashboard" className="text-primary text-sm hover:underline">
                            Go to Dashboard →
                        </Link>
                    </CardContent>
                </Card>

                <Card id="notifications" className="hover:border-primary/50 transition-colors scroll-mt-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Manage your notification preferences.
                        </p>
                        <span className="text-muted-foreground text-sm">Coming soon</span>
                    </CardContent>
                </Card>

                <Card id="security" className="hover:border-primary/50 transition-colors scroll-mt-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Manage your password and security settings.
                        </p>
                        <Link href="/reset-password" className="text-primary text-sm hover:underline">
                            Reset Password →
                        </Link>
                    </CardContent>
                </Card>

                <Card id="preferences" className="hover:border-primary/50 transition-colors scroll-mt-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-primary" />
                            Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Customize your experience and app preferences.
                        </p>
                        <span className="text-muted-foreground text-sm">Coming soon</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
