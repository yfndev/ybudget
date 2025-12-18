"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:pt-32 sm:pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
              Budgetverwaltung für{" "}
              <span className="text-primary">gemeinnützige Vereine.</span>
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-600 sm:mt-6 sm:text-2xl">
            Zeit ist Geld. Spare beides.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:mt-6 sm:text-lg">
            YBudget hilft dir, Budgets zu planen, Ausgaben zu tracken und
            Berichte für Förderer zu erstellen. Einfach und schnell :)
          </p>

          <div className="mt-8 flex justify-center sm:mt-10">
            <Button
              asChild
              size="lg"
              className="group h-11 px-6 text-sm font-semibold sm:h-12 sm:px-8 sm:text-base"
            >
              <Link href="/login">
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 sm:mt-16"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-2 rounded-2xl bg-linear-to-r from-gray-50 via-gray-100 to-gray-200 opacity-20 blur-xl sm:-inset-4 sm:rounded-3xl sm:blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl sm:shadow-2xl">
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src="https://www.loom.com/embed/59311d9ffde4452094bf2698419b2bdd?sid=a1234567-89ab-cdef-0123-456789abcdef"
                  frameBorder="0"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="YBudget Demo Video"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
