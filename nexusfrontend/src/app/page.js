"use client";

import HomeBackground from "@/component/Home/HomeBackground";
import HeroSection from "@/component/Home/HeroSection";
import InteractiveShowcase from "@/component/Home/InteractiveShowcase";
import PartnersSection from "@/component/Home/PartnersSection";
import NarrativePipeline from "@/component/Home/NarrativePipeline";

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
