"use client";

import Link from "next/link";

const footerLinks = {
  produkt: [
    { name: "Features", href: "#solution" },
    { name: "Preise", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ],
  rechtliches: [
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
  ],
  community: [
    { name: "Young Founders Network", href: "https://youngfounders.network" },
    { name: "LinkedIn", href: "https://linkedin.com/company/yfn" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold text-black">
              YBudget
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Budgetverwaltung für gemeinnützige Vereine. Ein Projekt des Young
              Founders Network.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h3 className="font-semibold text-black">Produkt</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.produkt.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="font-semibold text-black">Rechtliches</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-black">Community</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} YBudget. Made with love for
            non-profits in Germany.
          </p>
        </div>
      </div>
    </footer>
  );
}
