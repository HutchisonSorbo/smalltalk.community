import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-8xl font-bold text-primary/20">404</div>
            <h1 className="text-3xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for. It might have been 
              moved or doesn't exist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild data-testid="button-go-home">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} data-testid="button-go-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
