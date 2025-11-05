"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Problem", href: "#problem" },
    { name: "Lösung", href: "#solution" },
    { name: "Funktionen", href: "#how-it-works" },
    { name: "Preise", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              <span className="text-primary">YBudget</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Button asChild size="sm">
              <Link href="/login">Jetzt starten</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
              >
                {item.name}
              </a>
            ))}
            <div className="pt-2">
              <Button asChild className="w-full" size="sm">
                <Link href="/login">Jetzt starten</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
