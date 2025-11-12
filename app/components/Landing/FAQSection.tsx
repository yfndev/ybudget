"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Ist YBudget wirklich kostenlos für kleine Vereine?",
    answer:
      "Ja! Vereine mit bis zu 3 Projekten können YBudget komplett kostenlos nutzen – ohne Zeitlimit und ohne versteckte Kosten.",
  },
  {
    question: "Welche Banken werden unterstützt?",
    answer:
      "YBudget unterstützt CSV-Exporte aller deutschen Banken (Sparkasse, Volksbank, DKB, N26, etc.). Du lädst einfach deinen Kontoauszug hoch.",
  },
  {
    question: "Kann ich meine Daten exportieren?",
    answer:
      "Ja! Du kannst Berichte als PDF oder CSV exportieren und an jeden teilen – dein Steuerberater, dein Vorstand oder deine Förderer.",
  },
  {
    question: "Wie sicher sind meine Daten?",
    answer:
      "Deine Daten werden verschlüsselt übertragen und sicher gehostet. Wir verkaufen deine Daten nicht und haben keinen Zugriff auf deine Bankkonten.",
  },
  {
    question: "Kann ich YBudget testen, bevor ich zahle?",
    answer:
      "Ja! Der Professional Plan hat eine 14-tägige kostenlose Testphase – ohne Kreditkarte.",
  },
];

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="rounded-xl border border-slate-200 bg-white"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-slate-50"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-4">
          <p className="text-slate-600">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Häufig gestellte Fragen
          </h2>
        </motion.div>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
