"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowUpRight,
  Check,
  Loader2,
  Cpu,
  Layers,
  BookmarkCheck,
} from "lucide-react";
import Marquee from "react-fast-marquee";

const TECH_PARTNERS = [
  {
    name: "Google Gemini",
    role: "Multimodal Core",
    hoverBorder: "hover:border-[#1A73E8]/40",
    hoverBg: "hover:bg-[#1A73E8]/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(26,115,232,0.18)]",
    activeText: "group-hover:text-[#1A73E8]",
    logoSrc: "/Home/HeroSection/gemini.png",
  },
  {
    name: "OpenAI",
    role: "Embedding Model",
    hoverBorder: "hover:border-[#10A37F]/40",
    hoverBg: "hover:bg-[#10A37F]/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(16,163,127,0.18)]",
    activeText: "group-hover:text-[#10A37F]",
    logoSrc: "/Home/HeroSection/OpenAI.png",
  },
  {
    name: "MongoDB Atlas",
    role: "Vector Search",
    hoverBorder: "hover:border-[#00ED64]/40",
    hoverBg: "hover:bg-[#00ED64]/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(0,237,100,0.18)]",
    activeText: "group-hover:text-[#00684A]",
    logoSrc: "/Home/HeroSection/MongoDB_ForestGreen.png",
  },
  {
    name: "Groq",
    role: "LPU Inference",
    hoverBorder: "hover:border-[#F55036]/40",
    hoverBg: "hover:bg-[#F55036]/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(245,80,54,0.18)]",
    activeText: "group-hover:text-[#F55036]",
    logoSrc: "/Home/HeroSection/groq.png",
  },
  {
    name: "LangChain",
    role: "Agent Runtime",
    hoverBorder: "hover:border-emerald-700/40",
    hoverBg: "hover:bg-emerald-900/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(16,185,129,0.18)]",
    activeText: "group-hover:text-emerald-800",
    logoSrc: "/Home/HeroSection/LangChain_Logo_1.png",
  },
  {
    name: "Anthropic",
    role: "Reasoning Engine",
    hoverBorder: "hover:border-[#D97757]/40",
    hoverBg: "hover:bg-[#D97757]/5",
    hoverShadow: "hover:shadow-[0_10px_24px_-4px_rgba(217,119,87,0.18)]",
    activeText: "group-hover:text-[#D97757]",
    logoSrc: "/Home/HeroSection/claude.png",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const gradId = useId();
  const pathRef = useRef(null);

  // Normalised progress along the path: 0 to 1
  const [headProgress, setHeadProgress] = useState(0);
  const [tailProgress, setTailProgress] = useState(0);

  // Exact normalised positions (0 to 1) calculated from the SVG path
  const [nodeTriggers, setNodeTriggers] = useState({
    node1: 0.12,
    node2: 0.42,
    node3: 0.65,
    node4: 0.88,
  });

  useEffect(() => {
    // Measure the actual path geometry
    if (pathRef.current) {
      const totalLen = pathRef.current.getTotalLength();

      const getDistAtX = (targetX) => {
        let low = 0;
        let high = totalLen;
        for (let i = 0; i < 30; i++) {
          const mid = (low + high) / 2;
          const pt = pathRef.current.getPointAtLength(mid);
          if (pt.x < targetX) low = mid;
          else high = mid;
        }
        return (low + high) / 2;
      };

      const d1 = getDistAtX(160) / totalLen;
      const d2 = getDistAtX(600) / totalLen;
      const d3 = getDistAtX(920) / totalLen;
      const d4 = getDistAtX(1220) / totalLen;

      setNodeTriggers({
        node1: d1,
        node2: d2,
        node3: d3,
        node4: d4,
      });
    }

    let animationFrame;
    const CYCLE_DURATION = 11000;
    const startTime = performance.now();

    const updateLoop = (now) => {
      const elapsed = (now - startTime) % CYCLE_DURATION;
      const t = elapsed / CYCLE_DURATION;

      if (t < 0.55) {
        // Phase 1: Progressive fill left to right
        const fillNorm = t / 0.55;
        setHeadProgress(fillNorm);
        setTailProgress(0);
      } else if (t < 0.75) {
        // Phase 2: Hold all active
        setHeadProgress(1);
        setTailProgress(0);
      } else {
        // Phase 3: Wipe clears left to right
        const clearNorm = (t - 0.75) / 0.25;
        setHeadProgress(1);
        setTailProgress(clearNorm);
      }

      animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Spatial triggers derived dynamically from actual path length
  const isNode1Active =
    headProgress >= nodeTriggers.node1 && tailProgress < nodeTriggers.node1;
  const isNode2Active =
    headProgress >= nodeTriggers.node2 && tailProgress < nodeTriggers.node2;
  const isNode3Active =
    headProgress >= nodeTriggers.node3 && tailProgress < nodeTriggers.node3;
  const isNode4Active =
    headProgress >= nodeTriggers.node4 && tailProgress < nodeTriggers.node4;

  // Staggered execution ticks inside Node 2
  const step1Done = headProgress >= nodeTriggers.node2 + 0.03;
  const step2Done = headProgress >= nodeTriggers.node2 + 0.07;
  const step3Done = headProgress >= nodeTriggers.node2 + 0.11;
  const step4Done = headProgress >= nodeTriggers.node2 + 0.15;

  return (
    <section className="relative w-full min-h-screen bg-[var(--color-canvas)]/40 text-[var(--color-text-primary)] overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif] pt-8 sm:pt-12 pb-20 sm:pb-24 select-none transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. PROGRESSIVE FLOW PIPELINE (UNIFIED SVG COORDINATE SPACE) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full max-w-[1400px] mx-auto overflow-visible mb-6">
        <svg viewBox="0 0 1400 340" className="w-full h-auto overflow-visible pointer-events-none">
          <defs>
            <linearGradient
              id={`grad-${gradId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--color-main)" />
              <stop offset="45%" stopColor="var(--color-mid)" />
              <stop offset="100%" stopColor="var(--color-highlight)" />
            </linearGradient>

            <clipPath id={`clip-${gradId}`}>
              <rect
                x={`${tailProgress * 1400}`}
                y="0"
                width={`${Math.max(0, headProgress - tailProgress) * 1400}`}
                height="340"
              />
            </clipPath>
          </defs>

          {/* BASE STATIC TRACK */}
          <path
            ref={pathRef}
            d="M 0 44 L 460 44 C 505 44, 475 124, 520 124 L 1400 124"
            stroke="var(--color-border)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* PROGRESSIVE COLORED STROKE */}
          <path
            d="M 0 44 L 460 44 C 505 44, 475 124, 520 124 L 1400 124"
            stroke={`url(#grad-${gradId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            clipPath={`url(#clip-${gradId})`}
          />

          {/* ------------------------------------------------------------- */}
          {/* NODE 1: ASK AGENT (x = 80, path y = 44) */}
          {/* ------------------------------------------------------------- */}
          <foreignObject
            x="80"
            y="28"
            width="300"
            height="280"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`inline-flex items-center h-8 px-2 rounded-full border transition-all duration-300 transform-gpu will-change-transform ${
                  isNode1Active
                    ? "bg-[var(--color-surface)] border-[var(--color-main)] text-[var(--color-main)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors ${
                    isNode1Active
                      ? "text-[var(--color-main)] animate-pulse"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence>
                  {isNode1Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pl-1.5 pr-1"
                    >
                      Ask Agent
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="mt-4 w-64 h-[120px]">
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
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative p-3.5 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-main)]/30 shadow-[0_12px_32px_-8px_var(--color-glow),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-main)]/30 rotate-45" />
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-main)] animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
                            Prompt Input
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-[var(--color-main)] bg-[var(--color-main)]/10 px-1.5 py-0.5 rounded-md border border-[var(--color-main)]/20 font-bold">
                          Ch. 4 • Memory
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--color-text-primary)] leading-snug font-medium my-auto pr-1">
                        Synthesize Chapter 4 memory layout and generate an
                        active recall exam card.
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                          Target:{" "}
                          <strong className="text-[var(--color-text-primary)] font-semibold">
                            waitegoos.pdf
                          </strong>
                        </span>
                        <span className="h-6 w-6 rounded-lg bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] text-white flex items-center justify-center shadow-xs">
                          <ArrowUpRight size={13} strokeWidth={2.5} />
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>

          {/* ------------------------------------------------------------- */}
          {/* NODE 2: AGENT WORKFLOW (x = 540, path y = 124) */}
          {/* ------------------------------------------------------------- */}
          <foreignObject
            x="540"
            y="108"
            width="300"
            height="280"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`inline-flex items-center h-8 px-2 rounded-full border transition-all duration-300 transform-gpu will-change-transform ${
                  isNode2Active
                    ? "bg-[var(--color-surface)] border-[var(--color-mid)] text-[var(--color-mid)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors ${
                    isNode2Active
                      ? "text-[var(--color-mid)] animate-pulse"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence>
                  {isNode2Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pl-1.5 pr-1"
                    >
                      Agent Workflow
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="mt-4 w-60 h-[140px]">
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
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative p-3.5 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-mid)]/30 shadow-[0_12px_32px_-8px_var(--color-glow),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-mid)]/30 rotate-45" />
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-mid)] animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
                            Pipeline Run
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-mid)] bg-[var(--color-mid)]/10 px-1.5 py-0.5 rounded-md border border-[var(--color-mid)]/20">
                          {step4Done ? "4/4 Complete" : "Processing"}
                        </span>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono">
                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${step1Done ? "bg-[var(--color-canvas)]/80" : ""}`}
                        >
                          {step1Done ? (
                            <Check
                              size={11}
                              className="text-[var(--color-success)] font-bold"
                            />
                          ) : (
                            <Loader2
                              size={11}
                              className="animate-spin text-[var(--color-mid)]"
                            />
                          )}
                          <span
                            className={
                              step1Done
                                ? "text-[var(--color-text-primary)] font-bold"
                                : "text-[var(--color-text-muted)]"
                            }
                          >
                            EXTRACT IN-MEMORY PDF
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${step2Done ? "bg-[var(--color-canvas)]/80" : ""}`}
                        >
                          {step2Done ? (
                            <Check
                              size={11}
                              className="text-[var(--color-success)] font-bold"
                            />
                          ) : step1Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-[var(--color-mid)]"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-[var(--color-border)]" />
                          )}
                          <span
                            className={
                              step2Done
                                ? "text-[var(--color-text-primary)] font-bold"
                                : "text-[var(--color-text-muted)]"
                            }
                          >
                            REDACT PII PATTERNS
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${step3Done ? "bg-[var(--color-canvas)]/80" : ""}`}
                        >
                          {step3Done ? (
                            <Check
                              size={11}
                              className="text-[var(--color-success)] font-bold"
                            />
                          ) : step2Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-[var(--color-mid)]"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-[var(--color-border)]" />
                          )}
                          <span
                            className={
                              step3Done
                                ? "text-[var(--color-text-primary)] font-bold"
                                : "text-[var(--color-text-muted)]"
                            }
                          >
                            COSINE VECTOR CHUNKING
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${step4Done ? "bg-[var(--color-canvas)]/80" : ""}`}
                        >
                          {step4Done ? (
                            <Check
                              size={11}
                              className="text-[var(--color-success)] font-bold"
                            />
                          ) : step3Done ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-[var(--color-mid)]"
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-[var(--color-border)]" />
                          )}
                          <span
                            className={
                              step4Done
                                ? "text-[var(--color-text-primary)] font-bold"
                                : "text-[var(--color-text-muted)]"
                            }
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
          </foreignObject>

          {/* ------------------------------------------------------------- */}
          {/* NODE 3: AI DECISIONING (x = 860, path y = 124) */}
          {/* ------------------------------------------------------------- */}
          <foreignObject
            x="860"
            y="108"
            width="280"
            height="280"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`inline-flex items-center h-8 px-2 rounded-full border transition-all duration-300 transform-gpu will-change-transform ${
                  isNode3Active
                    ? "bg-[var(--color-surface)] border-[var(--color-highlight)] text-[var(--color-highlight)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors ${
                    isNode3Active
                      ? "text-[var(--color-highlight)] animate-pulse"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence>
                  {isNode3Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pl-1.5 pr-1"
                    >
                      AI Decisioning
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="mt-4 w-56 h-[140px]">
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
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative p-3.5 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-highlight)]/30 shadow-[0_12px_32px_-8px_var(--color-glow),0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-highlight)]/30 rotate-45" />
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-highlight)] animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
                            Decision Proof
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-highlight)] bg-[var(--color-highlight)]/10 px-1.5 py-0.5 rounded-md border border-[var(--color-highlight)]/20">
                          Ranked #1
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="p-1.5 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)] text-[9px]">
                            Chunk Match
                          </span>
                          <span className="text-[var(--color-highlight)] font-bold">
                            0.941 Sim
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)] text-[9px]">
                            Confidence
                          </span>
                          <span className="text-[var(--color-success)] font-bold">
                            0% Hallucination
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)] text-[9px]">
                            Engine
                          </span>
                          <span className="text-[var(--color-main)] font-bold">
                            Groq 70B
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>

          {/* ------------------------------------------------------------- */}
          {/* NODE 4: PERSONALIZED OUTPUT (x = 1140, path y = 124) */}
          {/* ------------------------------------------------------------- */}
          <foreignObject
            x="1110"
            y="108"
            width="310"
            height="320"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`inline-flex items-center h-8 px-2 rounded-full border transition-all duration-300 transform-gpu will-change-transform ${
                  isNode4Active
                    ? "bg-[var(--color-surface)] border-[var(--color-main)] text-[var(--color-main)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors ${
                    isNode4Active
                      ? "text-[var(--color-main)] animate-pulse"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence>
                  {isNode4Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden pl-1.5 pr-1"
                    >
                      Personalized Output
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="mt-4 w-72">
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
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="relative p-3.5 rounded-3xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-main)]/30 shadow-[0_20px_40px_-12px_var(--color-glow),0_6px_20px_-6px_rgba(0,0,0,0.06)] flex flex-col gap-2.5 transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-main)]/30 rotate-45" />
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-main)] animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
                            Synthesized Artifact
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-main)] bg-[var(--color-main)]/10 px-2 py-0.5 rounded-md border border-[var(--color-main)]/20">
                          Card #402
                        </span>
                      </div>

                      <div className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                            Exam Recall Card
                          </span>
                          <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            0% Hallucination
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                            Row-Major Offset Mapping
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            Compiler Construction • Page 137
                          </p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-text-primary)] flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-[9px] uppercase tracking-wider">
                          Formula
                        </span>
                        <span className="font-bold text-[var(--color-mid)]">
                          disp = sum((i_j - low_j) * d_j)
                        </span>
                      </div>

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-2 px-3 rounded-xl bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] hover:opacity-95 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[var(--color-glow)] active:scale-[0.98] cursor-pointer"
                      >
                        <span>Inspect In Workspace</span>
                        <ArrowUpRight size={13} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET HORIZONTAL STEPPER (< 1024px) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full px-6 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-[720px] pb-2">
          <div className="flex-1 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-[var(--color-main)] flex items-center gap-1">
              <Sparkles size={11} /> 01 • Ask Agent
            </span>
            <p className="text-xs text-[var(--color-text-primary)] font-medium mt-2">
              Synthesize Chapter 4 memory layout for exam prep.
            </p>
          </div>

          <div className="flex-1 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between font-mono text-[10px]">
            <span className="font-bold uppercase text-[var(--color-mid)] flex items-center gap-1">
              <Layers size={11} /> 02 • Workflow
            </span>
            <p className="text-[var(--color-text-muted)] mt-2">
              PDF Parser • PII Redact • Vector Chunk
            </p>
          </div>

          <div className="flex-1 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between font-mono text-[10px]">
            <span className="font-bold uppercase text-[var(--color-highlight)] flex items-center gap-1">
              <Cpu size={11} /> 03 • Decisioning
            </span>
            <p className="text-[var(--color-text-muted)] mt-2">
              Cosine: 0.941 • 0% Hallucination
            </p>
          </div>

          <div className="flex-1 p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
              <BookmarkCheck size={11} /> 04 • Active Recall
            </span>
            <p className="text-[11px] font-bold mt-1">
              Row-Major Mapping [p. 137]
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EDITORIAL HERO HEADLINE & ACTIONS */}
      {/* ========================================================================= */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 mt-2 sm:mt-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.08] sm:leading-[1.05]">
            The student, <br />
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)]">
              multiplied.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-xl font-normal">
            NexusNode is the agentic document intelligence system that
            synthesizes textbooks, handwritten notes, and lecture audio into
            verified, 1:1 exam mastery.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3.5 rounded-xl bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] hover:opacity-95 text-white font-bold text-sm transition-all shadow-md shadow-[var(--color-glow)] active:scale-95 cursor-pointer text-center"
            >
              Launch Workspace
            </button>

            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.lenis) {
                  window.lenis.scrollTo("#how-it-works", { offset: -80, duration: 1.4 });
                } else {
                  const element = document.getElementById("pipeline-overview") || document.getElementById("how-it-works");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/dashboard");
                  }
                }
              }}
              className="px-5 py-3.5 rounded-xl text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] text-sm font-bold transition-colors hover:bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer text-center"
            >
              See how it works →
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACADEMIC & TRUST FOUNDATIONS STRIP */}
        {/* ========================================================================= */}
        <div className="mt-16 sm:mt-24 pt-6 relative overflow-hidden select-none">
          {/* Edge-to-Edge Fog Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-linear-to-r from-[var(--color-canvas)] via-[var(--color-canvas)]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-linear-to-l from-[var(--color-canvas)] via-[var(--color-canvas)]/80 to-transparent z-10 pointer-events-none" />

          <Marquee
            speed={36}
            pauseOnHover={true}
            autoFill={true}
            gradient={false}
            className="overflow-visible"
          >
            {TECH_PARTNERS.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="group flex items-center gap-3.5 mx-7 sm:mx-10 py-3 cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
              >
                {/* Large Logo: Full Grayscale to Color Pop */}
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                  <img
                    src={item.logoSrc}
                    alt={`${item.name} logo`}
                    className="w-full h-full object-contain filter grayscale contrast-75 opacity-40 group-hover:filter-none group-hover:opacity-100 transition-all duration-300 ease-out"
                    loading="lazy"
                  />
                </div>

                {/* Large Brand Typography */}
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-text-muted)] font-['PP_Neue_Montreal',sans-serif] group-hover:text-[var(--color-text-primary)] transition-colors duration-300 whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
