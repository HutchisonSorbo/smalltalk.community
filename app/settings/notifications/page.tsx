import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { NotificationsForm } from "./notifications-form";
import { getUserPreferences } from "../actions";

export default async function NotificationsSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/settings/notifications");
    }

    const preferences = await getUserPreferences(user.id);

    if (!preferences) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure how you receive notifications.
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
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications.
                </p>
            </div>
            <Separator />
            <NotificationsForm initialData={preferences} />
        </div>
    );
}
