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
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      {/* <SocialProofSection /> */}
      <HowItWorksSection />
      <PricingSection />
      {/* <FAQSection /> */}
      <FinalCTASection />
      <Footer />
    </main>
  );
}
