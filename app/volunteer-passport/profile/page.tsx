import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VolunteerProfileForm } from "@/components/volunteer-passport/VolunteerProfileForm";
import { ProfilePassportTab } from "@/components/volunteer-passport/ProfilePassportTab";
import { ProfileBadgesTab } from "@/components/volunteer-passport/ProfileBadgesTab";
import { ProfilePortfolioTab } from "@/components/volunteer-passport/ProfilePortfolioTab";
import { getVolunteerProfile } from "@/app/volunteer-passport/actions/volunteer";
import { User, ShieldCheck, Award, Briefcase } from "lucide-react";

export default async function VolunteerProfilePage() {
    const profile = await getVolunteerProfile();

    if (!profile?.user?.id) {
        return (
            <div className="p-8 text-center" role="status">
                <p>Please complete your profile setup to continue.</p>
            </div>
        );
    }

    const userId = profile.user.id;

    const initialData = {
        headline: profile.headline || "",
        bio: profile.bio || "",
        locationSuburb: profile.locationSuburb || "",
        locationPostcode: profile.locationPostcode || ""
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Passport & Profile</h1>
                <p className="text-muted-foreground">Manage your digital identity, skills, and community impact.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:flex mb-8">
                    <TabsTrigger value="profile" className="flex gap-2">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="passport" className="flex gap-2">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Passport</span>
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="flex gap-2">
                        <Award className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Badges</span>
                    </TabsTrigger>
                    <TabsTrigger value="portfolio" className="flex gap-2">
                        <Briefcase className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Portfolio</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardContent className="pt-6">
                            <VolunteerProfileForm initialData={initialData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="passport">
                    <ProfilePassportTab
                        verificationStatus={profile.user.emailVerified ? "verified" : "pending"}
                        vcssChecked={false}
                        identityVerified={false}
                    />
                </TabsContent>

                <TabsContent value="badges">
                    <ProfileBadgesTab userId={userId} />
                </TabsContent>

                <TabsContent value="portfolio">
                    <ProfilePortfolioTab userId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}