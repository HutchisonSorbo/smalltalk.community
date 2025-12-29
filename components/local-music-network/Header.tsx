"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { GlobalSearch } from "@/components/local-music-network/GlobalSearch";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export function Header({ onSearch, searchPlaceholder = "Search musicians, equipment...", showSearch = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const navLinks = [
    { href: "/musicians", label: "Musicians" },
    { href: "/bands", label: "Bands" },
    { href: "/gigs", label: "Gigs" },
    { href: "/professionals", label: "Professionals" },
    { href: "/classifieds", label: "Auditions" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <Logo className="h-10 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <GlobalSearch />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                  data-testid="input-search-mobile"
                />
              </form>
            )}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-${link.label.toLowerCase()}-mobile`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// CodeRabbit Audit Trigger
