"use client";

import { motion } from "framer-motion";
import { FileSpreadsheet, DollarSign, Scale } from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Excel-Hölle",
    description:
      "Unübersichtliche Tabellen, veraltete Daten und niemand weiß, wer was wann geändert hat.",
  },
  {
    icon: DollarSign,
    title: "Teure Software",
    description:
      "Budget-Tools für Organisationen sind teuer und komplex – oft zu viel für kleine Vereine.",
  },
  {
    icon: Scale,
    title: "Keine Übersicht über die Ausgaben",
    description:
      "Wo ist das Geld wirklich hingegangen? Welches Budget bleibt noch? Niemand hat einen klaren Überblick.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="bg-slate-50 px-4 py-16 sm:py-24 sm:px-6 lg:px-8"
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
            Schluss mit Excel-Chaos und Steuerberater-Rechnungen
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:mt-6 sm:text-lg">
            Gemeinnützige Vereine haben besondere Anforderungen – aber die
            meisten Tools sind zu komplex oder zu teuer.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-2xl sm:p-8"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-xl">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 sm:mt-6 sm:text-xl">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
