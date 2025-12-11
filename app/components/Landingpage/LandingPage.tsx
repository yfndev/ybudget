"use client";

import { FinalCTASection } from "./FinalCTASection";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { Navbar } from "./Navbar";
import { PricingSection } from "./PricingSection";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
