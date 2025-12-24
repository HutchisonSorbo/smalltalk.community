import Link from "next/link";
import { Users, ShoppingBag, Plus, Music, ArrowRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/local-music-network/Header";
import dynamic from "next/dynamic";
import { Footer } from "@/components/local-music-network/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
const VictoriaMap = dynamic(() => import("@/components/local-music-network/VictoriaMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
});

import { DiscordWidget } from "@/components/local-music-network/DiscordWidget";
import { FeaturedContent } from "@/components/local-music-network/FeaturedContent";
import { updateLastActive } from "@/app/Local Music Network/actions/featured";

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      updateLastActive().catch(console.error);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Welcome back, {user?.firstName || "Musician"}!
              </h1>
              <p className="text-lg text-muted-foreground">
                What would you like to do today?
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-6">Discord Community</h2>
              <DiscordWidget />
            </div>
          </div>
        </section>

        <section className="py-12 bg-card">
          <div className="container mx-auto px-4 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-lg border bg-background">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild data-testid="button-edit-profile">
                  <Link href="/dashboard">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>

                <Button variant="outline" asChild data-testid="button-register-band">
                  <Link href="/bands/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Register Band
                  </Link>
                </Button>

                <Button variant="outline" asChild data-testid="button-register-gig">
                  <Link href="/gigs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Register Gig
                  </Link>
                </Button>
              </div>
            </div>

            {/* Featured Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Community Highlights</h2>
              <FeaturedContent />
            </div>

            {/* Victoria Map */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Community Map</h2>
              <p className="text-muted-foreground">See where other community members are located across Victoria.</p>
              <VictoriaMap />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
