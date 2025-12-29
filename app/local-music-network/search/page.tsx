import { storage } from "@/server/storage";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicianCard } from "@/components/local-music-network/MusicianCard";
import { BandCard } from "@/components/local-music-network/BandCard";
import { GigCard } from "@/components/local-music-network/GigCard";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
    const location = typeof searchParams.location === "string" ? searchParams.location : undefined;

    const [musicians, bands, gigs] = await Promise.all([
        storage.getMusicianProfiles({ location, searchQuery: query }),
        storage.getBands({ location, searchQuery: query }),
        storage.getGigs({ location, searchQuery: query, date: 'upcoming' }),
    ]);

    const hasResults = musicians.length > 0 || bands.length > 0 || gigs.length > 0;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Search Results</h1>
                    <p className="text-muted-foreground">
                        {query && `For "${query}"`}
                        {query && location && " in "}
                        {location && `${location}`}
                    </p>
                </div>

                {!hasResults ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No results found</h2>
                        <p className="text-muted-foreground">
                            Try adjusting your search terms or location.
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">All Results</TabsTrigger>
                            <TabsTrigger value="musicians">Musicians ({musicians.length})</TabsTrigger>
                            <TabsTrigger value="bands">Bands ({bands.length})</TabsTrigger>
                            <TabsTrigger value="gigs">Gigs ({gigs.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-8">
                            {musicians.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold mb-4">Musicians</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {musicians.slice(0, 6).map((musician) => (
                                            <MusicianCard key={musician.id} musician={musician} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {bands.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold mb-4">Bands</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {bands.slice(0, 6).map((band) => (
                                            <BandCard key={band.id} band={band} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {gigs.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-semibold mb-4">Gigs</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {gigs.slice(0, 6).map((gig) => (
                                            <GigCard key={gig.id} gig={gig} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        <TabsContent value="musicians">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {musicians.map((musician) => (
                                    <MusicianCard key={musician.id} musician={musician} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="bands">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bands.map((band) => (
                                    <BandCard key={band.id} band={band} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="gigs">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {gigs.map((gig) => (
                                    <GigCard key={gig.id} gig={gig} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>

            <Footer />
        </div>
    );
}

// CodeRabbit Audit Trigger
