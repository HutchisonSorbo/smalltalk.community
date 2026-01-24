import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { PreferencesForm } from "./preferences-form";
import { getUserPreferences } from "../actions";

export default async function PreferencesSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/settings/preferences");
    }

    const preferences = await getUserPreferences(user.id);

    if (!preferences) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                        Customise your experience on the platform.
                    </p>
                </div>
                <Separator />
                <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
                    Failed to load preferences. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Preferences</h3>
                <p className="text-sm text-muted-foreground">
                    Customise your experience and accessibility settings.
                </p>
            </div>
            <Separator />
            <PreferencesForm initialData={preferences} />
        </div>
    );
}
