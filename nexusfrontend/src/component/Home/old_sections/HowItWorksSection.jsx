"use client";

import { motion } from "framer-motion";
import { FileUp, Network, MessagesSquare } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Drop File",
      description: "Simply drag and drop your PDFs into the secure vault.",
      icon: <FileUp className="w-6 h-6 text-[var(--color-main)]" />,
      color: "from-[var(--color-main)] to-[var(--color-mid)]",
      glowColor: "bg-[var(--color-main)]",
    },
    {
      id: "02",
      title: "Vectorization",
      description:
        "Our AI builds a neural map of your document's context.",
      icon: <Network className="w-6 h-6 text-[var(--color-mid)]" />,
      color: "from-[var(--color-mid)] to-[var(--color-highlight)]",
      glowColor: "bg-[var(--color-mid)]",
    },
    {
      id: "03",
      title: "Ask & Solve",
      description:
        "Get instant citations, summaries, and deep insights.",
      icon: <MessagesSquare className="w-6 h-6 text-[var(--color-highlight)]" />,
      color: "from-[var(--color-highlight)] to-[var(--color-main)]",
      glowColor: "bg-[var(--color-highlight)]",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative z-10 w-full py-24 lg:py-32 flex flex-col items-center bg-[var(--color-surface)]/40 backdrop-blur-xl border-y border-[var(--color-border)] pointer-events-none transition-colors duration-200"
    >
      <div className="max-w-7xl w-full px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-text-primary)]">
            How It Works
          </h2>
          <p className="text-[var(--color-text-muted)] mt-4 text-sm md:text-lg max-w-xl mx-auto">
            From static data to dynamic intelligence in three simple steps.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pointer-events-auto">
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-[var(--color-border)]/60 -z-10">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)]"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative flex flex-col items-center text-center px-4 transform-gpu will-change-transform"
            >
              <div className="relative mb-8">
                <div
                  className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 rounded-full`}
                />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  {step.icon}
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] text-[10px] font-bold flex items-center justify-center shadow-lg">
                    {step.id}
                  </span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">
                {step.title}
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm md:text-base leading-relaxed max-w-62.5">
                {step.description}
              </p>
              <motion.div
                className={`mt-6 h-1 w-0 bg-linear-to-r ${step.color} rounded-full group-hover:w-12 transition-all duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
