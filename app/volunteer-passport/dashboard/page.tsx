import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Organisation Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Organisation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Organisation management tools will go here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
