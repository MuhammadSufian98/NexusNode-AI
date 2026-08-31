"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import GlassButton from "@/component/Button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh w-full max-w-[95%] md:max-w-7xl px-[5%] text-center pointer-events-none relative z-10 bg-transparent">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-[3vh] md:gap-[4vh]"
      >
        <motion.span
          variants={itemVariants}
          className="px-[4%] py-[1%] rounded-full border border-rose-100 bg-white/80 text-rose-600 text-[min(3.5vw,14px)] font-bold shadow-sm backdrop-blur-sm"
        >
          Neural Retrieval Engine v1.0
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="text-[clamp(2.2rem,9vw,5.5rem)] font-black tracking-tight text-slate-900 leading-[1.1] md:leading-[1.05]"
        >
          Talk to your{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-600 via-orange-500 to-yellow-500">
            PDFs
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="max-w-[90%] md:max-w-[75%] text-[clamp(1rem,4.5vw,1.6rem)] leading-relaxed text-slate-600"
        >
          Your PDFs, Now With a Human Brain. The most advanced neural retrieval
          engine for your documents.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-[3vh] w-full sm:w-auto pointer-events-auto"
        >
          <GlassButton
            variant="primary"
            className="w-full sm:w-auto text-[1.1rem] px-[10vw] sm:px-12 py-[1.2rem] bg-linear-to-r from-rose-600 to-orange-500 border-none text-white shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all"
            onClick={() => router.push("/dashboard")}
          >
            Launch App
          </GlassButton>
          <GlassButton
            variant="secondary"
            className="w-full sm:w-auto text-[1.1rem] px-[10vw] sm:px-12 py-[1.2rem] hover:bg-white transition-colors"
          >
            Documentation
          </GlassButton>
        </motion.div>
      </motion.div>
    </main>
  );
}
