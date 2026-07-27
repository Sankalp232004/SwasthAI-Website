import React from "react";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Workflow from "@/components/Workflow";
import InteractiveTriageSimulator from "@/components/InteractiveTriageSimulator";
import InteractiveRoiCalculator from "@/components/InteractiveRoiCalculator";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import DemoVideoSection from "@/components/DemoVideoSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import Testimonials from "@/components/Testimonials";
import FounderSection from "@/components/FounderSection";
import HomeBlogSection from "@/components/HomeBlogSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <Workflow />
      <InteractiveTriageSimulator />
      <InteractiveRoiCalculator />
      <ScreenshotsSection />
      <DemoVideoSection />
      <FeaturesGrid />
      <Testimonials />
      <FounderSection />
      <HomeBlogSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
