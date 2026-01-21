"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NavItem {
  name: string;
  href?: string;
  children?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Produkt",
    children: [
      { name: "Features", href: "#solution" },
      { name: "So funktioniert's", href: "#how-it-works" },
      { name: "Vorteile", href: "#benefits" },
    ],
  },
  {
    name: "Preise",
    href: "#pricing",
  },
  {
    name: "Support",
    children: [
      { name: "FAQ", href: "#faq" },
      { name: "Kontakt", href: "#contact" },
    ],
  },
  {
    name: "Über uns",
    children: [
      { name: "Young Founders Network", href: "https://youngfounders.network" },
      { name: "Impressum", href: "/impressum" },
      { name: "Datenschutz", href: "/datenschutz" },
    ],
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-black"
            >
              YBudget
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && setOpenDropdown(item.name)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.children ? (
                    <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      onClick={(e) => scrollToSection(e, item.href!)}
                      className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
                    >
                      {item.name}
                    </a>
                  )}

                  {/* Dropdown Menu */}
                  {item.children && openDropdown === item.name && (
                    <div className="absolute left-0 top-full z-50 min-w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                      {item.children.map((child) => (
                        <a
                          key={child.name}
                          href={child.href}
                          onClick={(e) => scrollToSection(e, child.href)}
                          className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <div className="hidden md:block">
            <Button
              asChild
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name
                        )
                      }
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-black transition-colors hover:bg-gray-100"
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.name && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <a
                            key={child.name}
                            href={child.href}
                            onClick={(e) => scrollToSection(e, child.href)}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href!)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-black transition-colors hover:bg-gray-100"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
