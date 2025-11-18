"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden  px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Budgetverwaltung für
              <br />
              <span className="text-primary">gemeinnützige Vereine.</span>
            </h1>
          </div>
          <p className="mt-6 text-xl text-slate-600 sm:text-2xl">
            Zeit ist Geld. Spare beides.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            YBudget hilft dir, Budgets zu planen, Ausgaben zu tracken und
            Berichte für Förderer zu erstellen. Einfach und schnell :)
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 px-8 text-base font-semibold"
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
          className="mt-16"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <Image
                src="/screenshots/Dashboard Overview.png"
                alt="YBudget Dashboard mit Budget-Übersicht, Transaktionen und Projekten"
                width={1200}
                height={800}
                className="w-full"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
