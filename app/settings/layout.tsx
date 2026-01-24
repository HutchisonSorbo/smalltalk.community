import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { SidebarNav } from "./components/SidebarNav";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account settings and preferences.",
};

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            redirect("/login?next=/settings");
        }

        return (
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="space-y-0.5">
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground text-lg">
                        Manage your account settings and set e-mail preferences.
                    </p>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="lg:w-1/5 overflow-x-auto pb-4 lg:pb-0">
                        <SidebarNav />
                    </aside>
                    <div className="flex-1 lg:max-w-2xl">{children}</div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("[SettingsLayout] Auth setup failed:", error);
        redirect("/login?next=/settings");
    }
}
