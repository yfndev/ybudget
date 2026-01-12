"use client";

import { motion } from "framer-motion";
import {
  Users,
  Tag,
  Building2,
  FolderOpen,
  Calendar,
  FileText,
} from "lucide-react";
import { YellowHighlight } from "./YellowHighlight";

const benefits = [
  {
    icon: Users,
    title: "Team Zusammenarbeit",
    description:
      "Arbeite mit deinem Team in Echtzeit an Budgets und Projekten. Jeder hat Zugang zu den relevanten Informationen.",
  },
  {
    icon: Tag,
    title: "Kategorisierung",
    description:
      "Organisiere Ausgaben mit flexiblen Kategorien. Erstelle eigene Tags für deine Vereinsstruktur.",
  },
  {
    icon: Building2,
    title: "Multi-Projekt Verwaltung",
    description:
      "Verwalte beliebig viele Projekte in einer Oberfläche. Perfekt für Vereine mit mehreren Förderprogrammen.",
  },
  {
    icon: FolderOpen,
    title: "Übersichtliche Struktur",
    description:
      "Behalte den Überblick mit einer klaren Projektstruktur. Budgets, Ausgaben und Berichte an einem Ort.",
  },
  {
    icon: Calendar,
    title: "Zeitraum-basierte Berichte",
    description:
      "Erstelle Berichte für beliebige Zeiträume. Ideal für Quartals- oder Jahresabschlüsse.",
  },
  {
    icon: FileText,
    title: "Export-Funktionen",
    description:
      "Exportiere Daten als PDF oder CSV. Perfekt für Förderer, Steuerberater oder Vorstandsmeetings.",
  },
];

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="bg-gray-50 px-4 py-16 sm:py-24 sm:px-6 lg:px-8"
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
            <YellowHighlight>Benefits</YellowHighlight>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base text-gray-600 sm:text-lg">
            Als Nutzer von YBudget hast du Zugriff auf alle Features, die du für
            deine Budgetverwaltung brauchst.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-lg border border-gray-200 bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center">
                  <Icon className="h-8 w-8 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-black">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
