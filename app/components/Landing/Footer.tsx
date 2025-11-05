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
    { name: "Impressum", href: "#impressum" },
    { name: "Datenschutz", href: "#privacy" },
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
    <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Community</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/AppIcon.png"
              alt="YBudget"
              width={24}
              height={24}
              className="size-8"
            />
            <span className="font-semibold text-slate-900">YBudget</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 YBudget. Made with ❤️ for non-profits in Germany.
          </p>
        </div>
      </div>
    </footer>
  );
}
