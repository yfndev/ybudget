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
      "Transferiere Budgets zwischen Projekten",
    ],
    screenshot: "/screenshots/Dashboard Overview.png",
  },
  {
    side: "right",
    title: "Transaktionen zuordnen statt suchen",
    description:
      "Importiere Kontoauszüge per CSV und ordne Transaktionen automatisch den richtigen Projekten und Kategorien zu. Kein manuelles Copy-Paste mehr.",
    bullets: [
      "CSV-Import (Sparkasse, Volksbank, Moss)",
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
      "Echtzeit Budget-Verfolgung pro Projekt",
      "Reisekosten- und Auslagenerstattung",
      "Logs für Nachvollziehbarkeit",
    ],
    screenshot: "/screenshots/Project Overview.png",
  },
  {
    side: "right",
    title: "Berichte für Förderer in 2 Klicks",
    description:
      "Erstelle professionelle Verwendungsnachweise und Budget-Reports für deine Förderer – ohne Excel-Akrobatik.",
    bullets: [
      "PDF Export",
      "Filterbar nach Projekt, Zeitraum, Förderer",
      "Ausgabennachweise als CSV-Export für Spender",
    ],
    screenshot: "/screenshots/Donor Overview.png",
  },
  {
    side: "left",
    title: "Zusammenarbeit leicht gemacht",
    description:
      "Lade dein Team per E-Mail ein und verwalte Zugriffsrechte. Jeder sieht nur, was er sehen soll.",
    bullets: [
      "E-Mail Einladungen",
      "Team- und Projektzugriffskontrolle",
      "Interaktives Onboarding für neue Nutzer",
    ],
    screenshot: "/screenshots/Invite.png",
  },
  {
    side: "right",
    title: "Ehrenamtspauschale ohne Papierkram",
    description:
      "Erstelle Links für Ehrenamtliche, die ihre Pauschale direkt digital einreichen können – inklusive Unterschrift vom Handy.",
    bullets: [
      "Teilbare Links für externe Einreichungen",
      "Mobile Unterschrift per QR-Code",
      "Automatische Validierung",
    ],
    screenshot: "/screenshots/Ehrenamtspauschale.png",
  },
  {
    side: "left",
    title: "KI-Assistent für dein Budget",
    description:
      "Frag deinen Finanzassistenten nach Insights und lass dir komplexe Auswertungen erklären.",
    bullets: [
      "Natürliche Sprache statt Formulare",
      "Budget Insights auf Knopfdruck",
      "Aktionen direkt aus dem Chat",
    ],
    screenshot: "/screenshots/AI.png",
  },
];

export function SolutionSection() {
  return (
    <section
      id="solution"
      className="bg-white px-4 py-16 sm:py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Dein Team wird es lieben:
          </h2>
        </motion.div>

        <div className="mt-12 space-y-16 sm:mt-24 sm:space-y-32">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid items-center gap-8 sm:gap-12 lg:grid-cols-2 ${
                feature.side === "right" ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div className={feature.side === "right" ? "lg:col-start-2" : ""}>
                <h3 className="text-xl font-bold text-slate-900 sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-base text-slate-600 sm:mt-4 sm:text-lg">
                  {feature.description}
                </p>
                <ul className="mt-6 space-y-2 sm:mt-8 sm:space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 sm:h-6 sm:w-6" />
                      <span className="text-sm text-slate-700 sm:text-base">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={feature.side === "right" ? "lg:col-start-1" : ""}>
                <div className="relative">
                  <div className="absolute -inset-2 rounded-xl bg-linear-to-r from-gray-200 to-gray-300 opacity-10 blur-lg sm:-inset-4 sm:rounded-2xl sm:blur-xl" />
                  <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-md sm:rounded-xl sm:shadow-lg">
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
