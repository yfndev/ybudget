"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bereit, dein Budget unter
            <br />
            Kontrolle zu bringen?
          </h2>
          <p className="mt-6 text-xl text-slate-300">
            Starte kostenlos – keine Kreditkarte erforderlich.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Link href="/login">YBudget testen</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" />
              Keine Kreditkarte erforderlich
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" />
              Jederzeit kündbar
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" />
              DSGVO-konform
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
