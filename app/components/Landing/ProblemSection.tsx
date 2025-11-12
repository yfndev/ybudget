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
    <section id="problem" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Schluss mit Excel-Chaos und
            <br />
            Steuerberater-Rechnungen
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            Gemeinnützige Vereine haben besondere Anforderungen – aber die
            meisten Tools sind zu komplex oder zu teuer.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {problem.title}
                </h3>
                <p className="mt-3 text-slate-600">{problem.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
