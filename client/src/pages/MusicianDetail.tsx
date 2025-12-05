import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Mail, Phone, Music, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { MusicianProfile } from "@shared/schema";

export default function MusicianDetail() {
  const [, params] = useRoute("/musicians/:id");
  const musicianId = params?.id;

  const { data: musician, isLoading } = useQuery<MusicianProfile>({
    queryKey: ["/api/musicians", musicianId],
    enabled: !!musicianId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-48 w-48 rounded-full mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!musician) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Musician Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The musician profile you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/musicians">Back to Musicians</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
              <Link href="/musicians">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Musicians
              </Link>
            </Button>

            <div className="grid md:grid-cols-[240px_1fr] gap-8">
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="h-48 w-48">
                  <AvatarImage 
                    src={musician.profileImageUrl || undefined} 
                    alt={musician.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {musician.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {musician.experienceLevel && (
                  <Badge variant="secondary" className="text-sm">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    {musician.experienceLevel}
                  </Badge>
                )}

                {musician.availability && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{musician.availability}</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-musician-name">{musician.name}</h1>
                  {musician.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{musician.location}</span>
                    </div>
                  )}
                </div>

                {musician.bio && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{musician.bio}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {musician.instruments && musician.instruments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary" />
                        Instruments
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {musician.instruments.map((instrument) => (
                          <Badge key={instrument} variant="outline">
                            {instrument}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {musician.genres && musician.genres.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {musician.genres.map((genre) => (
                          <Badge key={genre} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {musician.contactEmail && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a 
                            href={`mailto:${musician.contactEmail}`} 
                            className="font-medium hover:text-primary transition-colors"
                            data-testid="link-email"
                          >
                            {musician.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    {musician.contactPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <a 
                            href={`tel:${musician.contactPhone}`}
                            className="font-medium hover:text-primary transition-colors"
                            data-testid="link-phone"
                          >
                            {musician.contactPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    {!musician.contactEmail && !musician.contactPhone && (
                      <p className="text-muted-foreground text-sm">
                        No contact information provided.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
