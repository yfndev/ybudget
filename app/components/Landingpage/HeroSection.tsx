"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/button";
import { YellowHighlight } from "./YellowHighlight";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:pt-32 sm:pb-24 sm:px-6 lg:px-8">
      {/* Dotted background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="mx-auto max-w-5xl">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-black">
            YOUNG FOUNDERS NETWORK
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
            <YellowHighlight>Budgetverwaltung für</YellowHighlight>
            <br />
            <YellowHighlight>gemeinnützige Vereine.</YellowHighlight>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            YBudget hilft dir, Budgets zu planen, Ausgaben zu tracken und
            Berichte für Förderer zu erstellen. Einfach und schnell.
          </p>

          <div className="mt-8">
            <Button
              asChild
              className="h-12 bg-black px-8 text-base font-semibold text-white hover:bg-gray-800"
            >
              <Link href="/login">Kostenlos starten</Link>
            </Button>
          </div>
        </motion.div>

        {/* Loom Video */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12"
        >
          <div className="aspect-video overflow-hidden rounded-lg shadow-xl">
            <iframe
              src="https://www.loom.com/embed/59311d9ffde4452094bf2698419b2bdd"
              style={{ border: "none" }}
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
