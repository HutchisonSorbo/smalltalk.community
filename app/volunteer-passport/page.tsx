import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VolunteerPassportHome() {
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight">Victorian Volunteer Passport</h1>
                <p className="text-lg text-muted-foreground">
                    A centralised digital platform for volunteering, professional development, and community skill-sharing.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>For Volunteers</CardTitle>
                        <CardDescription>Manage your credentials, skills, and apply for roles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full">
                            <Link href="/volunteer-passport/profile">My Profile</Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/volunteer-passport/opportunities">Browse Opportunities</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>For Organisations</CardTitle>
                        <CardDescription>Post opportunities, manage applications, and verify volunteers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full">
                            <Link href="/volunteer-passport/dashboard">Organisation Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
