import { Link } from "wouter";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Music className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Vicband</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting Victoria's music community since 2024. Find musicians, 
              sell equipment, and build your musical network.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/musicians" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-musicians">
                  Find Musicians
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-marketplace">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="/api/login" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-signin">
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Victoria Regions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Melbourne</li>
              <li>Geelong</li>
              <li>Ballarat</li>
              <li>Bendigo</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Made for Victoria's musicians. Not affiliated with any other platform.</p>
        </div>
      </div>
    </footer>
  );
}
