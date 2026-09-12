"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Smartphone,
  Laptop,
  Mail,
  FileText,
  X,
  Sparkles,
  Check,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function DocumentIntelligenceNarrative() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const headingProgress = useTransform(
    scrollYProgress,
    [0.08, 0.32, 0.72, 0.95],
    [1, 0, 0, -1],
  );
  const paraY = useTransform(
    scrollYProgress,
    [0.14, 0.36, 0.74, 0.96],
    [90, 0, 0, -70],
  );
  const paraOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.32, 0.78, 0.96],
    [0, 1, 1, 0],
  );

  const line1 = "Documents didn't get longer.";
  const line2 = "Knowledge got buried.";

  return (
    <section
      ref={containerRef}
      className="relative z-20 w-full bg-[var(--color-canvas)] py-20 sm:py-28 lg:py-36 border-y border-[var(--color-border)] select-none overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif]"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 lg:pb-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200/80 bg-rose-50/60 mb-6 text-rose-600 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>The Document Paradox</span>
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-slate-950 leading-[1.08] flex flex-wrap">
              <span className="inline-block w-full">
                {line1.split("").map((char, index) => {
                  const charY = useTransform(
                    headingProgress,
                    (v) => v * (60 + index * 2.2),
                  );
                  const charOpacity = useTransform(
                    headingProgress,
                    (v) => 1 - Math.min(Math.abs(v) * 1.5, 1),
                  );
                  return (
                    <motion.span
                      key={index}
                      style={{ y: charY, opacity: charOpacity }}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  );
                })}
              </span>
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 inline-block w-full mt-1 sm:mt-2">
                {line2.split("").map((char, index) => {
                  const charY = useTransform(
                    headingProgress,
                    (v) => v * (80 + index * 3.5),
                  );
                  const charOpacity = useTransform(
                    headingProgress,
                    (v) => 1 - Math.min(Math.abs(v) * 1.5, 1),
                  );
                  return (
                    <motion.span
                      key={index}
                      style={{ y: charY, opacity: charOpacity }}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  );
                })}
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pt-4 text-slate-600 font-normal leading-relaxed text-base sm:text-lg overflow-hidden">
            <motion.div
              style={{ y: paraY, opacity: paraOpacity }}
              className="space-y-6"
            >
              <p>
                Researchers and students are drowning in 400-page syllabi,
                unstructured slides, and scanned reading packets. Finding a
                single proof or memory offset requires tedious keyword searches
                and hours of manual ctrl+F guesswork.
              </p>
              <p className="text-slate-900 font-medium">
                NexusNode AI restructures static paper into dynamic, vectorized
                thought graphs. Ask complex questions naturally, trace every
                answer back to exact paragraph coordinates, and study from
                automated active recall cards with zero hallucination.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-3xl bg-[#FAF9F6] p-6 sm:p-10 border border-rose-200/70 shadow-2xl shadow-rose-950/5 overflow-hidden mb-12"
        >
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-rose-100 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-600">
                State 01 • Fragmented Human Search Architecture
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full font-bold">
              <AlertTriangle size={12} />
              <span>5 Context Deadlocks Detected</span>
            </div>
          </div>

          <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden rounded-2xl bg-gradient-to-b from-white/90 via-rose-50/20 to-white/70 border border-rose-100">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #f43f5e 1.2px, transparent 1.2px)",
                backgroundSize: "28px 28px",
              }}
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 1000 380"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 500 190 C 420 190, 360 110, 290 95"
                stroke="#FDA4AF"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.path
                d="M 290 95 C 230 85, 170 120, 160 135"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              />
              <motion.path
                d="M 160 135 C 140 160, 110 200, 95 230"
                stroke="#FDA4AF"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              />
              <motion.path
                d="M 95 230 C 130 260, 180 280, 210 290"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              />
              <motion.path
                d="M 290 95 C 340 100, 390 125, 410 135"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              />

              <motion.path
                d="M 500 190 C 580 190, 640 110, 710 95"
                stroke="#FDA4AF"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              />
              <motion.path
                d="M 710 95 C 770 85, 830 120, 840 135"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              />
              <motion.path
                d="M 840 135 C 860 160, 890 200, 905 230"
                stroke="#FDA4AF"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
              />
              <motion.path
                d="M 905 230 C 870 260, 820 280, 790 290"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M 710 95 C 660 100, 610 125, 590 135"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              />

              <motion.path
                d="M 500 190 C 510 240, 520 280, 525 310"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              />
            </svg>

            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.85 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false }}
                className="relative w-16 h-16 rounded-2xl bg-white border border-rose-300 shadow-xl shadow-rose-500/20 flex items-center justify-center"
              >
                <Brain size={30} className="text-rose-600 animate-pulse" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] text-white font-mono font-bold items-center justify-center">
                    !
                  </span>
                </span>
              </motion.div>
              <span className="mt-2.5 px-3 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-2xs">
                Raw Human Limit
              </span>
            </div>

            <div className="absolute top-[25%] left-[29%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <Laptop size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                PDF Tab 1
              </span>
            </div>
            <div className="absolute top-[35.5%] left-[16%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <Mail size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Email Slides
              </span>
            </div>
            <div className="absolute top-[60.5%] left-[9.5%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <Smartphone size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Audio Tape
              </span>
            </div>

            <div className="absolute top-[25%] left-[71%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <FileText size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Handbook
              </span>
            </div>
            <div className="absolute top-[35.5%] left-[84%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <Mail size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Forum Q&A
              </span>
            </div>
            <div className="absolute top-[60.5%] left-[90.5%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-sm text-slate-700">
              <Smartphone size={15} className="text-rose-600" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Notes App
              </span>
            </div>

            <div className="absolute top-[35.5%] left-[41%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[10px] font-mono font-bold shadow-xs">
              <X size={12} strokeWidth={3} />
              <span>Mismatch</span>
            </div>
            <div className="absolute top-[76.3%] left-[21%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[10px] font-mono font-bold shadow-xs">
              <X size={12} strokeWidth={3} />
              <span>Lost Page</span>
            </div>
            <div className="absolute top-[35.5%] left-[59%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[10px] font-mono font-bold shadow-xs">
              <X size={12} strokeWidth={3} />
              <span>0 Matches</span>
            </div>
            <div className="absolute top-[76.3%] left-[79%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[10px] font-mono font-bold shadow-xs">
              <X size={12} strokeWidth={3} />
              <span>Hallucination</span>
            </div>
            <div className="absolute top-[81.5%] left-[52.5%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[10px] font-mono font-bold shadow-xs">
              <X size={12} strokeWidth={3} />
              <span>Context Drop</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-3xl bg-slate-950 p-6 sm:p-10 border border-slate-800 shadow-2xl shadow-emerald-950/20 overflow-hidden"
        >
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                State 02 • Clean Vector Synthesis with NexusNode AI
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>100% Deterministic Grounding</span>
            </div>
          </div>

          <div className="relative w-full min-h-[380px] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #10b981 1.4px, transparent 1.4px)",
                backgroundSize: "28px 28px",
              }}
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 1000 380"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="streamGradEmerald"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <motion.path
                d="M 500 190 C 420 190, 350 110, 280 95"
                stroke="url(#streamGradEmerald)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
              <motion.path
                d="M 280 95 C 220 85, 170 120, 150 145"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
              />
              <motion.path
                d="M 150 145 C 130 170, 110 200, 95 240"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.75, delay: 0.35, ease: "easeOut" }}
              />
              <motion.path
                d="M 95 240 C 130 270, 170 285, 220 295"
                stroke="#34D399"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              />

              <motion.path
                d="M 500 190 C 580 190, 650 110, 720 95"
                stroke="url(#streamGradEmerald)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.85, delay: 0.1, ease: "easeOut" }}
              />
              <motion.path
                d="M 720 95 C 780 85, 830 120, 850 145"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.75, delay: 0.25, ease: "easeOut" }}
              />
              <motion.path
                d="M 850 145 C 870 170, 890 200, 905 240"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.75, delay: 0.4, ease: "easeOut" }}
              />
              <motion.path
                d="M 905 240 C 870 270, 830 285, 780 295"
                stroke="#34D399"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
              />

              <motion.path
                d="M 500 190 C 500 240, 500 280, 500 315"
                stroke="#34D399"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
              />
            </svg>

            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.85 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false }}
                className="relative px-4 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 backdrop-blur-md"
              >
                <Brain size={24} className="text-emerald-400" />
                <span className="text-slate-500 font-mono text-xs font-light">
                  ×
                </span>
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <img
                    src="/favicon/logo.png"
                    alt="NexusNode AI Logo"
                    className="w-full h-full object-contain filter brightness-0 invert-[60%] sepia-[80%] saturate-[500%] hue-rotate-[115deg]"
                  />
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-slate-950 font-mono font-black items-center justify-center">
                    ✓
                  </span>
                </span>
              </motion.div>
              <span className="mt-2.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-2xs">
                Synthesized Core
              </span>
            </div>

            <div className="absolute top-[25%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <Laptop size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                PDF Parser
              </span>
            </div>
            <div className="absolute top-[38%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <Mail size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Slide OCR
              </span>
            </div>
            <div className="absolute top-[63%] left-[9.5%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <Smartphone size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Whisper Audio
              </span>
            </div>

            <div className="absolute top-[25%] left-[72%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <FileText size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Token Vector
              </span>
            </div>
            <div className="absolute top-[38%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <Mail size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                0.941 Cosine
              </span>
            </div>
            <div className="absolute top-[63%] left-[90.5%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md text-emerald-300">
              <Smartphone size={15} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline-block">
                Study Feed
              </span>
            </div>

            <div className="absolute top-[77.5%] left-[22%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold shadow-xs">
              <Check size={12} strokeWidth={3} className="text-emerald-400" />
              <span>0% Hallucination</span>
            </div>
            <div className="absolute top-[77.5%] left-[78%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold shadow-xs">
              <Check size={12} strokeWidth={3} className="text-emerald-400" />
              <span>Card #402 Ready</span>
            </div>
            <div className="absolute top-[83%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold shadow-xs">
              <Zap size={12} className="text-emerald-400" />
              <span>380ms Inference</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
