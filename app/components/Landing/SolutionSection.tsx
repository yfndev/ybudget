"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

const features = [
  {
    side: "left",
    title: "Budgets planen in Minuten, nicht Stunden",
    description:
      "Erstelle Projekte, weise Budgets zu und plane erwartete Ausgaben. YBudget zeigt dir sofort, wie viel Budget noch verfügbar ist – in Echtzeit.",
    bullets: [
      "Projekte nach Förderern oder Departments organisieren",
      "Erwartete Ausgaben planen und tracken",
      "Budget-Warnungen bei Überschreitung",
    ],
    screenshot: "/screenshots/Dashboard Overview.png",
  },
  {
    side: "right",
    title: "Transaktionen zuordnen statt suchen",
    description:
      "Importiere Kontoauszüge per CSV und ordne Transaktionen automatisch den richtigen Projekten und Kategorien zu. Kein manuelles Copy-Paste mehr.",
    bullets: [
      "CSV-Import von allen deutschen Banken",
      "Smart Matching mit erwarteten Ausgaben",
      "Automatische Kategorisierung",
    ],
    screenshot: "/screenshots/Import Overview.png",
  },
  {
    side: "left",
    title: "Ausgaben organisieren nach Projekten",
    description:
      "Ordne alle Ausgaben deinen Projekten zu und sehe sofort, welches Budget noch verfügbar ist. Jede Transaktion an den richtigen Ort.",
    bullets: [
      "Automatische Zuordnung nach Kategorie",
      "Echtzeit Budget-Verfolgung pro Projekt",
      "Klare Ausgabenhistorie und Audit Trail",
    ],
    screenshot: "/screenshots/Project Overview.png",
  },
  {
    side: "right",
    title: "Berichte für Förderer in 2 Klicks",
    description:
      "Erstelle professionelle Verwendungsnachweise und Budget-Reports für deine Förderer – ohne Excel-Akrobatik.",
    bullets: [
      "PDF-Export mit Logo und Branding",
      "Filterbar nach Projekt, Zeitraum, Förderer",
      "Transparente Aufschlüsselung aller Ausgaben",
    ],
    screenshot: "/screenshots/Donor Overview.png",
  },
];

export function SolutionSection() {
  return (
    <section id="solution" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Alles, was du brauchst.
            <br />
            Nichts, was dich überfordert.
          </h2>
        </motion.div>

        <div className="mt-24 space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                feature.side === "right" ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div className={feature.side === "right" ? "lg:col-start-2" : ""}>
                <h3 className="text-3xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg text-slate-600">
                  {feature.description}
                </p>
                <ul className="mt-8 space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0 text-emerald-500" />
                      <span className="text-slate-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={feature.side === "right" ? "lg:col-start-1" : ""}>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 opacity-10 blur-xl" />
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-lg">
                    <Image
                      src={feature.screenshot}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
