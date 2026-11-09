"use client";

import HomeBackground from "@/components/Home/HomeBackground";
import HeroSection from "@/components/Home/HeroSection";
import InteractiveShowcase from "@/components/Home/InteractiveShowcase";
import PartnersSection from "@/components/Home/PartnersSection";
import NarrativePipeline from "@/components/Home/NarrativePipeline";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-main)]/20 transition-colors duration-200">
      <HomeBackground />
      <div className="relative z-10 flex flex-col w-full overflow-hidden items-center">
        <HeroSection />
        <InteractiveShowcase />
        <PartnersSection />
        <NarrativePipeline />
      </div>
    </div>
  );
}
