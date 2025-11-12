"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const organizations = [
  { name: "Young Founders Network", logo: "/logos/yfn.svg" },
  { name: "Jugend gründet", logo: "/logos/jugend-gruendet.svg" },
  { name: "Startup Teens", logo: "/logos/startup-teens.svg" },
  { name: "Enactus", logo: "/logos/enactus.svg" },
  { name: "YES", logo: "/logos/yes.svg" },
];

export function TrustBar() {
  return (
    <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-sm font-medium text-slate-500">
            Vertraut von über 50 gemeinnützigen Organisationen
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {organizations.map((org) => (
              <div
                key={org.name}
                className="flex h-12 items-center justify-center grayscale transition-all hover:grayscale-0"
              >
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
