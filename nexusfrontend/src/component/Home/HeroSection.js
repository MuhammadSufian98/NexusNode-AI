"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowUpRight,
  Check,
  Loader2,
  Cpu,
  ShieldCheck,
  FileText,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const gradId = useId();

  const [headProgress, setHeadProgress] = useState(0);
  const [tailProgress, setTailProgress] = useState(0);

  useEffect(() => {
    let animationFrame;
    const CYCLE_DURATION = 11000; // 11s total cycle
    const startTime = performance.now();

    const updateLoop = (now) => {
      const elapsed = (now - startTime) % CYCLE_DURATION;
      const t = elapsed / CYCLE_DURATION;

      if (t < 0.55) {
        // Phase 1: Progressive fill from left to right
        const fillNorm = t / 0.55;
        setHeadProgress(fillNorm * 100);
        setTailProgress(0);
      } else if (t < 0.75) {
        // Phase 2: Hold all nodes active
        setHeadProgress(100);
        setTailProgress(0);
      } else {
        // Phase 3: Gray wipe clears from left to right
        const clearNorm = (t - 0.75) / 0.25;
        setHeadProgress(100);
        setTailProgress(clearNorm * 100);
      }

      animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Spatial node triggers matching x% along the canvas
  const isNode1Active = headProgress >= 18 && tailProgress < 18;
  const isNode2Active = headProgress >= 38 && tailProgress < 38;
  const isNode3Active = headProgress >= 52 && tailProgress < 52;
  const isNode4Active = headProgress >= 66 && tailProgress < 66;

  // Staggered loaders inside Node 2
  const step1Done = headProgress >= 41;
  const step2Done = headProgress >= 46;
  const step3Done = headProgress >= 51;
  const step4Done = headProgress >= 56;

  return (
    <section className="relative w-full min-h-screen bg-[#FAF9F6] text-slate-900 overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif] pt-12 pb-24 select-none">
      {/* ========================================================================= */}
      {/* 1. PROGRESSIVE FLOW PIPELINE */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-visible mb-12">
        {/* Full-width responsive SVG layer */}
        <div className="absolute inset-x-0 top-0 h-[180px] pointer-events-none w-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 180"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={`grad-${gradId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="45%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>

              {/* Dynamic window clip revealing gradient between tailProgress & headProgress */}
              <clipPath id={`clip-${gradId}`}>
                <rect
                  x={`${tailProgress}%`}
                  y="0"
                  width={`${Math.max(0, headProgress - tailProgress)}%`}
                  height="180"
                />
              </clipPath>
            </defs>

            {/* BASE STATIC TRACK */}
            <path
              d="M 0 44 L 460 44 C 505 44, 475 124, 520 124 L 1440 124"
              stroke="#E2E8F0"
              strokeWidth="2.5"
              fill="none"
            />

            {/* PROGRESSIVE COLORED STROKE */}
            <path
              d="M 0 44 L 460 44 C 505 44, 475 124, 520 124 L 1440 124"
              stroke={`url(#grad-${gradId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              clipPath={`url(#clip-${gradId})`}
            />
          </svg>
        </div>

        {/* NODES CONTAINER */}
        <div className="relative max-w-[1360px] mx-auto px-6 sm:px-10 h-[260px]">
          {/* ------------------------------------------------------------- */}
          {/* NODE 1: ASK AGENT (Path Level: y = 44px) */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute left-[4%] sm:left-[6%] top-[44px] -translate-y-1/10 flex flex-col items-start z-10">
            {/* Morphing Pill */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border transition-colors duration-300 ${
                isNode1Active
                  ? "bg-white border-rose-400 text-rose-600 shadow-lg shadow-rose-500/15"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <Sparkles
                size={13}
                className={`shrink-0 transition-colors duration-300 ${
                  isNode1Active
                    ? "text-rose-600 animate-pulse"
                    : "text-slate-400"
                }`}
              />
              <AnimatePresence initial={false}>
                {isNode1Active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pr-1"
                  >
                    Ask Agent
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Prompt Box */}
            <div className="mt-4 w-60 sm:w-64 h-[120px]">
              <AnimatePresence>
                {isNode1Active && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -12,
                      scale: 0.94,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.96,
                      filter: "blur(4px)",
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1], // Custom spring curve
                    }}
                    className="relative p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-rose-200/80 shadow-[0_12px_32px_-8px_rgba(225,29,72,0.12),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full group"
                  >
                    {/* Top Subtle Connector Triangle pointing back up to the Sparkle pill */}
                    <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-rose-200/80 rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.01)]" />

                    {/* Header Micro-Tags */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                          Prompt Input
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                        Ch. 4 • Memory
                      </span>
                    </div>

                    {/* Prompt Query Copy */}
                    <p className="text-[12px] text-slate-800 leading-snug font-medium my-auto pr-1">
                      Synthesize Chapter 4 memory layout and generate an active
                      recall exam card.
                    </p>

                    {/* Bottom Action Tray */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-slate-400">
                        RAG Target:{" "}
                        <strong className="text-slate-600 font-semibold">
                          waitegoos.pdf
                        </strong>
                      </span>
                      <span className="h-6 w-6 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-rose-500/30 group-hover:scale-105 transition-transform duration-200">
                        <ArrowUpRight size={13} strokeWidth={2.5} />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* NODE 2: AGENT WORKFLOW (Path Level: y = 194px) */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute left-[30%] sm:left-[31%] top-[192px] -translate-y-1/2 flex flex-col items-start z-10">
            {/* Morphing Pill */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border transition-colors duration-300 ${
                isNode2Active
                  ? "bg-white border-orange-400 text-orange-600 shadow-lg shadow-orange-500/15"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <Sparkles
                size={13}
                className={`shrink-0 transition-colors duration-300 ${
                  isNode2Active
                    ? "text-orange-600 animate-pulse"
                    : "text-slate-400"
                }`}
              />
              <AnimatePresence initial={false}>
                {isNode2Active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pr-1"
                  >
                    Agent Workflow
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Checklist Box */}
            <div className="mt-4 w-52 sm:w-60 h-[120px]">
              <AnimatePresence>
                {isNode2Active && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -12,
                      scale: 0.94,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.96,
                      filter: "blur(4px)",
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative w-56 sm:w-64 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-orange-200/80 shadow-[0_12px_32px_-8px_rgba(249,115,22,0.12),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between"
                  >
                    {/* Top Anchor Notch pointing up toward Agent Workflow pill */}
                    <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-orange-200/80 rotate-45" />

                    {/* Header Telemetry */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                          Pipeline Run
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {step4Done ? "4/4 Complete" : "Processing"}
                      </span>
                    </div>

                    {/* Execution Step Rows */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                      {/* Step 1 */}
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-200 ${
                          step1Done ? "bg-slate-50/80" : "bg-transparent"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {step1Done ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          ) : (
                            <Loader2
                              size={11}
                              className="animate-spin text-orange-500"
                            />
                          )}
                        </div>
                        <span
                          className={`transition-colors duration-200 ${
                            step1Done
                              ? "text-slate-800 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          EXTRACT IN-MEMORY PDF
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-200 ${
                          step2Done ? "bg-slate-50/80" : "bg-transparent"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {step2Done ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          ) : step1Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-orange-500"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <span
                          className={`transition-colors duration-200 ${
                            step2Done
                              ? "text-slate-800 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          REDACT PII PATTERNS
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-200 ${
                          step3Done ? "bg-slate-50/80" : "bg-transparent"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {step3Done ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          ) : step2Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-orange-500"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <span
                          className={`transition-colors duration-200 ${
                            step3Done
                              ? "text-slate-800 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          COSINE VECTOR CHUNKING
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-200 ${
                          step4Done ? "bg-slate-50/80" : "bg-transparent"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {step4Done ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          ) : step3Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-orange-500"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <span
                          className={`transition-colors duration-200 ${
                            step4Done
                              ? "text-slate-800 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          ISOLATE TOP-K CITATIONS
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* NODE 3: AI DECISIONING (Path Level: y = 194px) */}
          {/* ------------------------------------------------------------- */}
          <div className="hidden md:flex absolute left-[56%] top-[194px] -translate-y-1/2 flex-col items-start z-10">
            {/* Morphing Pill */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border transition-colors duration-300 ${
                isNode3Active
                  ? "bg-white border-amber-400 text-amber-600 shadow-lg shadow-amber-500/15"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <Sparkles
                size={13}
                className={`shrink-0 transition-colors duration-300 ${
                  isNode3Active
                    ? "text-amber-600 animate-pulse"
                    : "text-slate-400"
                }`}
              />
              <AnimatePresence initial={false}>
                {isNode3Active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pr-1"
                  >
                    AI Decisioning
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Semantic Data Card */}
            <div className="mt-4 w-48 sm:w-52 h-[120px]">
              <AnimatePresence>
                {isNode3Active && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -12,
                      scale: 0.94,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.96,
                      filter: "blur(4px)",
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative w-56 sm:w-60 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-amber-200/80 shadow-[0_12px_32px_-8px_rgba(245,158,11,0.14),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between"
                  >
                    {/* Top Anchor Notch pointing up toward AI Decisioning pill */}
                    <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-amber-200/80 rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.01)]" />

                    {/* Header Telemetry */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                          Decision Telemetry
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                        Ranked Top-1
                      </span>
                    </div>

                    {/* Metric Breakdown Rows */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                      {/* Row 1: Chunk Match & Cosine Score */}
                      <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                            Chunk Match
                          </span>
                          <span className="font-semibold text-slate-800">
                            Page 137, Waite & Goos
                          </span>
                        </div>
                        <span className="text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-300/40">
                          0.941 Sim
                        </span>
                      </div>

                      {/* Row 2: Grounding Confidence */}
                      <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                            Confidence Proof
                          </span>
                          <span className="font-semibold text-slate-800">
                            Grounding Matrix
                          </span>
                        </div>
                        <span className="text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-300/40">
                          0% Hallucination
                        </span>
                      </div>

                      {/* Row 3: Inference Engine & Latency */}
                      <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                            Inference Node
                          </span>
                          <span className="font-semibold text-slate-800">
                            Groq Llama 3.3 70B
                          </span>
                        </div>
                        <span className="text-rose-600 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-300/40">
                          ~380ms
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* NODE 4: PERSONALIZED OUTPUT (Path Level: y = 200px) */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute right-[4%] sm:right-[6%] top-[220px] -translate-y-1/2 flex flex-col items-start z-10">
            {/* Morphing Pill */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border transition-colors duration-300 ${
                isNode4Active
                  ? "bg-white border-rose-400 text-rose-600 shadow-lg shadow-rose-500/15"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <Sparkles
                size={13}
                className={`shrink-0 transition-colors duration-300 ${
                  isNode4Active
                    ? "text-rose-600 animate-pulse"
                    : "text-slate-400"
                }`}
              />
              <AnimatePresence initial={false}>
                {isNode4Active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pr-1"
                  >
                    Personalized Output
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Dropdown Output Card directly under Node 4 */}
            <div className="mt-4 w-60 sm:w-64 h-[180px]">
              <div className="mt-8 w-72 sm:w-80">
                <AnimatePresence>
                  {isNode4Active && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -14,
                        scale: 0.93,
                        filter: "blur(5px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.96,
                        filter: "blur(4px)",
                      }}
                      transition={{
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="relative p-3.5 rounded-3xl bg-white/95 backdrop-blur-xl border border-rose-200/80 shadow-[0_20px_40px_-12px_rgba(225,29,72,0.16),0_6px_20px_-6px_rgba(0,0,0,0.06)] flex flex-col gap-3"
                    >
                      {/* Top Anchor Notch pointing up directly to the Personalized Output pill */}
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-rose-200/80 rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.01)]" />

                      {/* Header Telemetry */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                            Synthesized Artifact
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                          Card #402
                        </span>
                      </div>

                      {/* Visual Media Canvas (Warm Cinematic Mesh Background) */}
                      <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
                        {/* Subtle Ambient Mesh Glows */}
                        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-rose-500/25 blur-2xl pointer-events-none" />
                        <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-orange-500/20 blur-2xl pointer-events-none" />

                        {/* Top Canvas Tag Strip */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                            Exam Recall Card
                          </span>
                          <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            0% Hallucination
                          </span>
                        </div>

                        {/* Canvas Bottom Title and Source Reference */}
                        <div className="relative z-10">
                          <p className="text-xs font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                            Row-Major Offset Mapping
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            Compiler Construction • Page 137
                          </p>
                        </div>
                      </div>

                      {/* Formula Block */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[10px] text-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 text-[9px] uppercase tracking-wider">
                          Formula
                        </span>
                        <span className="font-bold text-orange-600">
                          disp = sum((i_j - low_j) * d_j)
                        </span>
                      </div>

                      {/* Launch Workspace CTA */}
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/20 active:scale-[0.98] cursor-pointer"
                      >
                        <span>Inspect In Workspace</span>
                        <ArrowUpRight size={13} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EDITORIAL HERO HEADLINE & ACTIONS */}
      {/* ========================================================================= */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 mt-6 sm:mt-8">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-slate-950 leading-[1.05]">
            The student, <br />
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
              multiplied.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-600 leading-relaxed max-w-xl font-normal">
            NexusNode is the agentic document intelligence system that
            synthesizes textbooks, handwritten notes, and lecture audio into
            verified, 1:1 exam mastery.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm transition-all shadow-md shadow-rose-900/20 active:scale-95 cursor-pointer"
            >
              Launch Workspace
            </button>

            <button
              onClick={() => {
                const element = document.getElementById("pipeline-overview");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/dashboard");
                }
              }}
              className="px-5 py-3.5 rounded-xl text-slate-700 hover:text-slate-950 text-sm font-bold transition-colors hover:bg-slate-100 cursor-pointer"
            >
              See how it works →
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACADEMIC & TRUST FOUNDATIONS STRIP */}
        {/* ========================================================================= */}
        <div className="mt-28 pt-8 border-t border-slate-200/90">
          <p className="text-xs font-mono tracking-wider uppercase text-slate-400">
            Engineered with verified academic technologies & benchmarks
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center mt-6 text-slate-500 font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <Cpu size={16} /> Groq Llama 3.3
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <ShieldCheck size={16} /> AES-256 BYOK
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <FileText size={16} /> In-Memory Parser
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <BookOpen size={16} /> Cosine Similarity
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <Sparkles size={16} /> MongoDB Atlas
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
              <GraduationCap size={16} /> Zero Hallucination
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
