"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with tuned inertia and soft deceleration
    const lenis = new Lenis({
      duration: 1.4, // Longer glide duration
      // Custom exponential ease-out curve for a natural, frictionless roll-to-stop
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9, // Balanced wheel sensitivity
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Expose instance globally for components that need to trigger scroll (Header, Nav)
    window.lenis = lenis;

    let animationFrameId;

    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      if (window.lenis === lenis) {
        window.lenis = null;
      }
    };
  }, []);

  return <>{children}</>;
}
