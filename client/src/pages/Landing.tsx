import { Link } from "wouter";
import { Music, Users, ShoppingBag, MapPin, ArrowRight, Guitar, Mic2, Drum } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <MapPin className="h-4 w-4" />
                <span>Victoria, Australia</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Connect with Victoria's{" "}
                <span className="text-primary">Music Community</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Find musicians, join bands, buy and sell equipment. The premier classifieds 
                platform for Victoria's vibrant music scene.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild data-testid="button-browse-musicians">
                  <Link href="/musicians">
                    <Users className="mr-2 h-5 w-5" />
                    Browse Musicians
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-browse-marketplace">
                  <Link href="/marketplace">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Marketplace
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
                Whether you're looking for band members or selling gear, Vicband makes it easy.
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
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Buy & Sell Gear</h3>
                  <p className="text-muted-foreground">
                    List your equipment for sale or find great deals on instruments and accessories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Sound</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect with musicians across all genres and instruments in Victoria.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Guitar, label: "Guitarists" },
                { icon: Mic2, label: "Vocalists" },
                { icon: Drum, label: "Drummers" },
                { icon: Music, label: "Keyboardists" },
              ].map((item) => (
                <Card key={item.label} className="hover-elevate cursor-pointer">
                  <CardContent className="p-6 text-center space-y-3">
                    <item.icon className="h-10 w-10 mx-auto text-primary" />
                    <p className="font-medium">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" asChild data-testid="button-view-all-musicians">
                <Link href="/musicians">
                  View All Musicians
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
                <a href="/api/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
