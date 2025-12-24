import Link from "next/link";
import { Music, Users, ShoppingBag, MapPin, ArrowRight, Guitar, Mic2, Drum, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import dynamic from "next/dynamic";

const VictoriaMap = dynamic(() => import("@/components/local-music-network/VictoriaMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
});

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={true} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">
                <MapPin className="h-4 w-4" />
                <span>Victoria, Australia</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Connect with Victoria's{" "}
                <span className="text-primary">Music Community</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Find musicians, bands, and gigs. Supporting Victoria's vibrant music scene.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild data-testid="button-browse-musicians">
                  <Link href="/musicians">
                    <Users className="mr-2 h-5 w-5" />
                    Browse Musicians
                  </Link>
                </Button>
                <Button size="lg" asChild data-testid="button-browse-bands">
                  <Link href="/bands">
                    <Music className="mr-2 h-5 w-5" />
                    Browse Bands
                  </Link>
                </Button>
                <Button size="lg" asChild data-testid="button-browse-gigs">
                  <Link href="/gigs">
                    <Calendar className="mr-2 h-5 w-5" />
                    Browse Gigs
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you're looking for other musicians, a band, or a local gig, Local Music Network keeps it simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Create Your Profile</h3>
                  <p className="text-muted-foreground">
                    Sign up and showcase your skills, instruments, and musical style to the community.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Connect & Collaborate</h3>
                  <p className="text-muted-foreground">
                    Browse musicians in your area, filter by instrument or genre, and reach out to collaborate.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Find Gigs & Bands</h3>
                  <p className="text-muted-foreground">
                    Discover local bands, find gig opportunities, and connect with other groups in the scene.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>



        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Join?</h2>
              <p className="text-lg text-muted-foreground">
                Sign up today and become part of Victoria's largest musician community.
                It's free to create a profile and start connecting.
              </p>
              <Button size="lg" asChild data-testid="button-get-started">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="pt-8 w-full max-w-4xl mx-auto">
                <VictoriaMap />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
