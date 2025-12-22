"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, ArrowLeft, Trash2, Mail } from "lucide-react";
import { format } from "date-fns";
import { Classified } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ClassifiedDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const id = params.id as string;

    const { data: ad, isLoading, error } = useQuery<Classified>({
        queryKey: [`/api/classifieds/${id}`],
        queryFn: async () => {
            const res = await fetch(`/api/classifieds/${id}`);
            if (!res.ok) throw new Error("Not found");
            return res.json();
        }
    });

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            const res = await fetch(`/api/classifieds/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast({
                title: "Deleted",
                description: "Listing removed successfully",
            });
            router.push("/classifieds");
        } catch (e) {
            toast({
                title: "Error",
                description: "Could not delete listing",
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-[300px] w-full" />
                </main>
            </div>
        );
    }

    if (error || !ad) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
                    <Button onClick={() => router.push("/classifieds")}>
                        Back to Auditions
                    </Button>
                </main>
            </div>
        );
    }

    const isOwner = user?.id === ad.userId;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/classifieds")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Auditions
                </Button>

                <Card className="max-w-3xl mx-auto border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant={ad.type === 'musician_wanted' ? 'default' : 'secondary'}>
                                {ad.type === 'musician_wanted' ? 'Musician Wanted' : 'Band Wanted'}
                            </Badge>
                            {ad.instrument && <Badge variant="outline">{ad.instrument}</Badge>}
                            {ad.genre && <Badge variant="outline">{ad.genre}</Badge>}
                        </div>
                        <CardTitle className="text-3xl font-bold">{ad.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground mt-2 gap-4">
                            <span className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                {ad.location}
                            </span>
                            {ad.createdAt && (
                                <span className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Posted {format(new Date(ad.createdAt), 'MMMM d, yyyy')}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                            {ad.description}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                        {isOwner ? (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Listing
                            </Button>
                        ) : (
                            <Button>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact Poster
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
