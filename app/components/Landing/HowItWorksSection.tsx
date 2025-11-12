"use client";

import { motion } from "framer-motion";
import { FolderPlus, DollarSign, Download, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: FolderPlus,
    title: "Projekte anlegen",
    description: "Erstelle Projekte für Events, Chapter oder Förderprogramme",
  },
  {
    number: "2",
    icon: DollarSign,
    title: "Budget planen",
    description: "Weise Budgets zu und plane erwartete Ausgaben",
  },
  {
    number: "3",
    icon: Download,
    title: "Transaktionen importieren",
    description: "Importiere Kontoauszüge und ordne sie automatisch zu",
  },
  {
    number: "4",
    icon: BarChart3,
    title: "Berichte erstellen",
    description: "Exportiere Verwendungsnachweise für Förderer",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            So einfach geht's
          </h2>
        </motion.div>

        <div className="mt-16">
          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-primary/60 lg:block" />

            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="grid items-center gap-8 lg:grid-cols-2">
                      <div
                        className={`${
                          index % 2 === 0
                            ? "lg:text-right"
                            : "lg:col-start-2 lg:text-left"
                        }`}
                      >
                        <div
                          className={`inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${
                            index % 2 === 0 ? "" : "lg:flex-row-reverse"
                          }`}
                        >
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                            <Icon className="h-8 w-8" />
                          </div>
                          <div
                            className={index % 2 === 0 ? "lg:text-right" : ""}
                          >
                            <div className="text-sm font-semibold text-primary">
                              Schritt {step.number}
                            </div>
                            <h3 className="mt-1 text-xl font-bold text-slate-900">
                              {step.title}
                            </h3>
                            <p className="mt-2 text-slate-600">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`hidden lg:block ${
                          index % 2 === 0 ? "lg:col-start-2" : "lg:col-start-1"
                        }`}
                      />
                    </div>

                    <div className="absolute left-1/2 top-1/2 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary shadow-lg lg:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
