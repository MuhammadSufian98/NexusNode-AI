"use client";

import Antigravity from "@/component/Antigravity";
import { useThemeStore } from "@/store/themeStore";

export default function HomeBackground() {
  const palette = useThemeStore((state) => state.palette);
  const particleColor = palette?.main || "#E11D48";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[var(--color-main)]/10 blur-[100px] rounded-full transition-colors duration-500" />
      <div className="absolute top-0 right-[-5%] w-[30%] h-[30%] bg-[var(--color-mid)]/10 blur-[100px] rounded-full transition-colors duration-500" />
      <Antigravity
        count={500}
        magnetRadius={4}
        ringRadius={4}
        waveSpeed={0.6}
        waveAmplitude={1}
        particleSize={2}
        lerpSpeed={0.09}
        color={particleColor}
        autoAnimate
        particleVariance={1}
        rotationSpeed={0}
        depthFactor={1}
        pulseSpeed={13}
        particleShape="capsule"
        fieldStrength={2}
      />
    </div>
  );
}
