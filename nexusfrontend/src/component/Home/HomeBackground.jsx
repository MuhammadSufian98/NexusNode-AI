"use client";

import Antigravity from "@/component/Antigravity";
import { useThemeStore } from "@/store/themeStore";

export default function HomeBackground() {
  const palette = useThemeStore((state) => state.palette);
  const particleColor = palette?.main || "#E11D48";

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden transform-gpu"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Lightweight GPU radial ambient glows without heavy blur overlays */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[var(--color-main)]/10 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-[-5%] w-[30%] h-[30%] bg-[var(--color-mid)]/10 blur-[90px] rounded-full pointer-events-none" />
      <Antigravity
        count={200}
        magnetRadius={4.5}
        ringRadius={4}
        waveSpeed={0.5}
        waveAmplitude={0.8}
        particleSize={1.8}
        lerpSpeed={0.08}
        color={particleColor}
        autoAnimate
        particleVariance={1}
        rotationSpeed={0}
        depthFactor={1.2}
        pulseSpeed={8}
        particleShape="capsule"
        fieldStrength={2}
      />
    </div>
  );
}
