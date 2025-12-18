"use client";

import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Changelog", href: "#changelog" },
    { name: "Roadmap", href: "#roadmap" },
  ],
  resources: [
    { name: "Dokumentation", href: "#docs" },
    { name: "Blog", href: "#blog" },
    { name: "FAQ", href: "#faq" },
    { name: "Support", href: "#support" },
  ],
  company: [
    { name: "Über uns", href: "#about" },
    { name: "Kontakt", href: "#contact" },
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
  ],
  community: [
    { name: "Young Founders Network", href: "#yfn" },
    { name: "GitHub", href: "#github" },
    { name: "Twitter", href: "#twitter" },
    { name: "LinkedIn", href: "#linkedin" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">Product</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-600 transition-colors hover:text-slate-900 sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">Resources</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-600 transition-colors hover:text-slate-900 sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">Company</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-600 transition-colors hover:text-slate-900 sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">Community</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-600 transition-colors hover:text-slate-900 sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:mt-12 sm:flex-row sm:gap-4 sm:pt-8">
          <div className="flex items-center gap-2">
            <Image
              src="/AppIcon.png"
              alt="YBudget"
              width={24}
              height={24}
              className="size-6 sm:size-8"
            />
            <span className="text-sm font-semibold text-slate-900 sm:text-base">YBudget</span>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">
            © 2025 YBudget. Made with ❤️ for non-profits in Germany.
          </p>
        </div>
      </div>
    </footer>
  );
}
