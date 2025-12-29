import Link from "next/link";
import { Music } from "lucide-react";
import { AboriginalFlag } from "./AboriginalFlag";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Music className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Local Music Network</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting Victoria's music community since 2026.
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
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-signin">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>


        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AboriginalFlag className="h-4 w-6 rounded-sm" />
            <p>Local Music Network acknowledges the Traditional Owners of Country throughout Victoria. We pay our respects to Elders past and present.</p>
            <AboriginalFlag className="h-4 w-6 rounded-sm" />
          </div>
          <p className="mb-8">Made for Victoria's musicians. Not affiliated with any other platform.</p>
          <p>&copy; 2025 smalltalk.community</p>
        </div>
      </div>
    </footer>
  );
}

// CodeRabbit Audit Trigger
