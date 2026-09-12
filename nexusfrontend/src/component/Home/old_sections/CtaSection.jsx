"use client";

import { motion } from "framer-motion";
import GlassButton from "@/component/Button";

export default function CtaSection() {
  return (
    <section className="relative z-20 w-full py-24 lg:py-40 flex flex-col items-center justify-center overflow-hidden bg-[var(--color-canvas)] border-t border-[var(--color-border)] transition-colors duration-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[var(--color-main)]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 md:gap-10 transform-gpu will-change-transform"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
            Ready to upgrade your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)]">
              Workflow?
            </span>
          </h2>

          <p className="max-w-xl text-[var(--color-text-muted)] text-base md:text-xl leading-relaxed">
            Join thousands of researchers and developers using NexusNode AI
            to turn complex documents into actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full sm:w-auto">
            <GlassButton
              variant="primary"
              className="w-full sm:w-auto text-base lg:text-lg px-10 py-4 bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] border-none text-white shadow-xl shadow-[var(--color-glow)]"
            >
              Create Free Account
            </GlassButton>
            <GlassButton
              variant="secondary"
              className="w-full sm:w-auto text-base lg:text-lg px-10 py-4 text-[var(--color-text-primary)] border-[var(--color-border)]"
            >
              Contact Sales
            </GlassButton>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-[-10%] w-[120%] aspect-square rounded-full border-t border-[var(--color-main)]/20 bg-[var(--color-surface)]/50 backdrop-blur-3xl z-0" />
    </section>
  );
}
