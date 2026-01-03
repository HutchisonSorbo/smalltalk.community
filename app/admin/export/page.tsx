import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportDataClient } from "./export-data-client";
import {
    Download,
    FileJson,
    Sheet,
    Users,
    Music,
    Building2,
    Heart,
    Activity,
} from "lucide-react";

const exportables = [
    {
        id: "users",
        name: "Users",
        description: "All user accounts and profile data",
        icon: Users,
        tables: ["users", "userPrivacySettings", "userNotificationPreferences"],
    },
    {
        id: "musicians",
        name: "Local Music Network - Musicians",
        description: "Musician profiles, instruments, and preferences",
        icon: Music,
        tables: ["musicianProfiles"],
    },
    {
        id: "bands",
        name: "Local Music Network - Bands",
        description: "Band profiles and member relationships",
        icon: Users,
        tables: ["bands", "bandMembers"],
    },
    {
        id: "gigs",
        name: "Local Music Network - Gigs",
        description: "Gig listings and event data",
        icon: Activity,
        tables: ["gigs"],
    },
    {
        id: "volunteers",
        name: "Volunteer Passport - Volunteers",
        description: "Volunteer profiles and credentials",
        icon: Heart,
        tables: ["volunteerProfiles", "volunteerCredentials"],
    },
    {
        id: "organisations",
        name: "Volunteer Passport - Organisations",
        description: "Organisation profiles and members",
        icon: Building2,
        tables: ["organisations", "organisationMembers"],
    },
    {
        id: "activity_log",
        name: "Admin Activity Log",
        description: "Audit trail of admin actions",
        icon: Activity,
        tables: ["adminActivityLog"],
    },
];

export default function ExportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
                <p className="text-muted-foreground">Export platform data for analysis and reporting</p>
            </div>

            {/* Format Info */}
            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <Sheet className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium">CSV Format</p>
                            <p className="text-sm text-muted-foreground">Best for spreadsheets (Excel, Google Sheets)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <FileJson className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium">JSON Format</p>
                            <p className="text-sm text-muted-foreground">Best for developers and APIs</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Available Exports
                    </CardTitle>
                    <CardDescription>Select data to export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {exportables.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-muted">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                    <div className="flex gap-1 mt-1">
                                        {item.tables.map((table) => (
                                            <Badge key={table} variant="outline" className="text-xs">
                                                {table}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <ExportDataClient exportId={item.id} name={item.name} />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardContent className="pt-6">
                    <p className="text-sm text-yellow-700">
                        <strong>Privacy Notice:</strong> Exported data may contain personal information.
                        Handle with care and ensure compliance with privacy policies and regulations.
                        All exports are logged in the activity trail.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
