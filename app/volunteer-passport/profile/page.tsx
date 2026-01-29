import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VolunteerProfileForm } from "@/components/volunteer-passport/VolunteerProfileForm";
import { ProfilePassportTab } from "@/components/volunteer-passport/ProfilePassportTab";
import { ProfileBadgesTab } from "@/components/volunteer-passport/ProfileBadgesTab";
import { ProfilePortfolioTab } from "@/components/volunteer-passport/ProfilePortfolioTab";
import { getVolunteerProfile } from "@/app/volunteer-passport/actions/volunteer";
import { User, ShieldCheck, Award, Briefcase } from "lucide-react";

type ProfileTabsProps = {
    initialData: {
        headline: string;
        bio: string;
        locationSuburb: string;
        locationPostcode: string;
    };
    userId: string;
    emailVerified: boolean;
};

function ProfileTabs({ initialData, userId, emailVerified }: ProfileTabsProps) {
    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:flex mb-8" aria-label="Profile navigation">
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
                    verificationStatus={emailVerified ? "verified" : "pending"}
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
    );
}

export default async function VolunteerProfilePage() {
    let profile;
    try {
        profile = await getVolunteerProfile();
    } catch (error) {
        console.error("VolunteerProfilePage: failed to fetch profile", error);
        throw error;
    }

    if (!profile?.user?.id) {
        return (
            <output className="p-8 text-center block w-full" aria-live="polite">
                <p>Please complete your profile setup to continue.</p>
            </output>
        );
    }

    const userId = profile.user.id;
    const emailVerified = Boolean(profile.user.emailVerified);

    const initialData = {
        headline: profile.headline || "",
        bio: profile.bio || "",
        locationSuburb: profile.locationSuburb || "",
        locationPostcode: profile.locationPostcode || ""
    };

    return (
        <div className="space-y-6 max-w-full lg:max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Passport & Profile</h1>
                <p className="text-muted-foreground">Manage your digital identity, skills, and community impact.</p>
            </div>

            <ProfileTabs 
                initialData={initialData} 
                userId={userId} 
                emailVerified={emailVerified} 
            />
        </div>
    );
}