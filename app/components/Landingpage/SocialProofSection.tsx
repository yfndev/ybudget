"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "Vorher haben wir Stunden damit verbracht, Excel-Tabellen zu pflegen. Mit YBudget sehen wir in Echtzeit, wie viel Budget noch verfügbar ist. Game changer.",
    author: "Lisa Schmidt",
    role: "Schatzmeisterin",
    organization: "Young Founders Network",
    photo: "/testimonials/lisa-schmidt.jpg",
    logo: "/logos/yfn-color.svg",
  },
  {
    quote:
      "Endlich ein Tool, das für gemeinnützige Vereine gebaut wurde – nicht für Konzerne. Die steuerliche Zuordnung spart uns hunderte Euro Steuerberater-Kosten.",
    author: "Maximilian Weber",
    role: "Vorstand",
    organization: "Startup Teens e.V.",
    photo: "/testimonials/max-weber.jpg",
    logo: "/logos/startup-teens-color.svg",
  },
  {
    quote:
      "Wir verwalten 15 Projekte mit unterschiedlichen Förderern. YBudget gibt uns endlich den Überblick, den wir brauchen.",
    author: "Sarah Müller",
    role: "Geschäftsführerin",
    organization: "Jugend gründet",
    photo: "/testimonials/sarah-mueller.jpg",
    logo: "/logos/jugend-gruendet-color.svg",
  },
];

export function SocialProofSection() {
  return (
    <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Vereine, die YBudget lieben
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 items-center">
                <Image
                  src={testimonial.logo}
                  alt={testimonial.organization}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <blockquote className="flex-1 text-slate-700">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                  <Image
                    src={testimonial.photo}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-slate-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.organization}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
