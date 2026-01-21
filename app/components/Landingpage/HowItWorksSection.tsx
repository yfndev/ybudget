"use client";

import { motion } from "framer-motion";
import { FolderPlus, DollarSign, Download, BarChart3 } from "lucide-react";
import { YellowHighlight } from "./YellowHighlight";

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
    <section
      id="how-it-works"
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
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            <YellowHighlight>So funktioniert's</YellowHighlight>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Icon className="h-8 w-8 text-black" />
                </div>
                <div className="mt-4 text-sm font-semibold text-gray-500">
                  Schritt {step.number}
                </div>
                <h3 className="mt-2 text-lg font-bold text-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
