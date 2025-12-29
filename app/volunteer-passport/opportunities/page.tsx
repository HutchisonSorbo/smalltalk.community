import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OpportunitiesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Browse Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>List of opportunities will go here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

// CodeRabbit Audit Trigger
