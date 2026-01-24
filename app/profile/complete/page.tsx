import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { ProfileCompletionWizard } from "./profile-completion-wizard";

export const metadata = {
    title: "Complete Your Profile | smalltalk.community",
    description: "Complete your profile to unlock all features of the platform.",
};

export default async function ProfileCompletePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/profile/complete");
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <ProfileCompletionWizard user={user} />
        </div>
    );
}
