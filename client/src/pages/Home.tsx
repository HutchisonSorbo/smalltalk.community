import { Link } from "wouter";
import { Users, ShoppingBag, Plus, Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Find Musicians</CardTitle>
                  <CardDescription>
                    Browse musician profiles and connect with local talent in Victoria.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" data-testid="button-find-musicians">
                    <Link href="/musicians">
                      Browse Musicians
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Marketplace</CardTitle>
                  <CardDescription>
                    Buy and sell music equipment, find services, or offer lessons.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline" data-testid="button-browse-gear">
                    <Link href="/marketplace">
                      Browse Gear
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Your Dashboard</CardTitle>
                  <CardDescription>
                    Manage your musician profile and marketplace listings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline" data-testid="button-go-dashboard">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-lg border bg-background">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <p className="text-muted-foreground">
                  Create a new profile or list something for sale
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild data-testid="button-create-profile">
                  <Link href="/dashboard?tab=profile&action=create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild data-testid="button-post-listing">
                  <Link href="/dashboard?tab=listings&action=create">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Listing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
