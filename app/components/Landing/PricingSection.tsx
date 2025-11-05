"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const tiers = [
  {
    name: "YBudget Premium",
    price: "24,99€",
    period: "/ Monat",
    description: "Volle Flexibilität mit monatlicher Zahlung",
    features: [
      "Unbegrenzte Projekte",
      "Unbegrenzte Transaktionen",
      "CSV-Import",
      "Erweiterte Kategorisierung",
      "Steuerliche Zuordnung",
      "PDF-Export mit Branding",
      "Prioritäts-Support",
      "Multi-User",
    ],
    cta: "2 Wochen kostenlos testen",
    href: "/login",
    popular: false,
  },
  {
    name: "YBudget  Premium Yearly",
    price: "249€",
    period: "/ Jahr",
    priceCalculation: "24,99€ × 12 = 299,88€",
    description: "Spare über 50€ mit jährlicher Zahlung",
    features: [
      "Unbegrenzte Projekte",
      "Unbegrenzte Transaktionen",
      "CSV-Import",
      "Erweiterte Kategorisierung",
      "Steuerliche Zuordnung",
      "PDF-Export mit Branding",
      "Prioritäts-Support",
      "Multi-User",
    ],
    cta: "2 Wochen kostenlos testen",
    href: "/login",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Transparent. Fair.
            <br />
            Ohne versteckte Kosten.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            YBudget ist kostenlos für kleine Vereine. Größere Organisationen
            zahlen nur für das, was sie nutzen.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md ${
                tier.popular
                  ? "border-primary ring-2 ring-primary"
                  : "border-slate-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    Beliebteste Wahl
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-lg text-slate-600">
                      {tier.period}
                    </span>
                  )}
                </div>
                {"priceCalculation" in tier && tier.priceCalculation && (
                  <p className="mt-2 text-sm text-slate-500 line-through">
                    {tier.priceCalculation}
                  </p>
                )}
                <p className="mt-4 text-sm text-slate-600">
                  {tier.description}
                </p>
              </div>

              <ul className="my-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.popular ? "default" : "outline"}
                size="lg"
                className="w-full"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-slate-500"
        >
          Alle Preise zzgl. MwSt. Jederzeit kündbar.
        </motion.p>
      </div>
    </section>
  );
}
