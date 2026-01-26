"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { YellowHighlight } from "./YellowHighlight";

const faqs = [
  {
    question: "Ist YBudget wirklich kostenlos?",
    answer:
      "Ja! YBudget Free ist dauerhaft kostenlos und enthält bis zu 3 Projekte, unbegrenzte Transaktionen und CSV-Import. Für größere Vereine gibt es Premium-Pläne mit erweiterten Features.",
  },
  {
    question: "Welche Banken werden beim CSV-Import unterstützt?",
    answer:
      "Wir unterstützen derzeit Sparkasse, Volksbank und Moss. Weitere Banken werden regelmäßig hinzugefügt. Falls deine Bank fehlt, kontaktiere uns gerne.",
  },
  {
    question: "Ist YBudget DSGVO-konform?",
    answer:
      "Ja, YBudget ist vollständig DSGVO-konform. Alle Daten werden verschlüsselt übertragen und sicher gehostet. Wir verkaufen deine Daten nicht und haben keinen Zugriff auf deine Bankkonten.",
  },
  {
    question: "Kann ich YBudget mit meinem Team nutzen?",
    answer:
      "Mit YBudget Premium kannst du unbegrenzt Teammitglieder einladen und Zugriffsrechte verwalten. Jedes Teammitglied kann nur die Projekte sehen, für die es berechtigt ist.",
  },
  {
    question: "Kann ich YBudget testen, bevor ich zahle?",
    answer:
      "Ja! Der Premium Plan hat eine 14-tägige kostenlose Testphase – ohne Kreditkarte.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="bg-gray-50 px-4 py-16 sm:py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            <YellowHighlight>FAQ</YellowHighlight>
          </h2>
        </motion.div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="rounded-lg border border-gray-200 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-black">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 shrink-0 text-black" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-black" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
