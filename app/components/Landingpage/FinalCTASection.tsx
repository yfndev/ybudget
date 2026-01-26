"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { YellowHighlight } from "./YellowHighlight";

export function FinalCTASection() {
  return (
    <section className="bg-white px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            <YellowHighlight>Bereit, dein Budget</YellowHighlight>
            <br />
            <YellowHighlight>unter Kontrolle zu bringen?</YellowHighlight>
          </h2>
          <p className="mt-6 text-base text-gray-600 sm:text-lg">
            Starte kostenlos – keine Kreditkarte erforderlich.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 bg-black px-8 text-base font-semibold text-white hover:bg-gray-800"
            >
              <Link href="/login">Kostenlos starten</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-black" />
              Keine Kreditkarte
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-black" />
              Jederzeit kündbar
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-black" />
              DSGVO-konform
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
