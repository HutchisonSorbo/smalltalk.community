import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getUserGrowthData } from "@/lib/admin-queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { UserGrowthChart } from "@/components/platform/admin/user-growth-chart";

const getCachedUserGrowthData = unstable_cache(
    async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return getUserGrowthData(thirtyDaysAgo, now, "day");
    },
    [CACHE_TAGS.ADMIN_USER_GROWTH],
    { revalidate: 3600 } // Cache for 1 hour
);

export async function UserGrowthSection() {
    const growthData = await getCachedUserGrowthData();

    // Calculate trend
    const totalNewUsers = growthData.reduce((sum, d) => sum + d.users, 0);
    const avgPerDay = growthData.length > 0 ? Math.round(totalNewUsers / growthData.length * 10) / 10 : 0;

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        User Growth
                    </CardTitle>
                    <CardDescription>New user registrations over the last 30 days</CardDescription>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{totalNewUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        ~{avgPerDay}/day avg
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <UserGrowthChart data={growthData} />
            </CardContent>
        </Card>
    );
}
