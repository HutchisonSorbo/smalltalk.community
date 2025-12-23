import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VolunteerProfileForm } from "@/components/volunteer-passport/VolunteerProfileForm";
import { getVolunteerProfile } from "@/app/volunteer-passport/actions/volunteer";

export default async function VolunteerProfilePage() {
    const profile = await getVolunteerProfile();

    const initialData = profile ? {
        headline: profile.headline || "",
        bio: profile.bio || "",
        locationSuburb: profile.locationSuburb || "",
        locationPostcode: profile.locationPostcode || ""
    } : undefined;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">My Volunteer Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your public profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <VolunteerProfileForm initialData={initialData} />
                </CardContent>
            </Card>
        </div>
    );
}
