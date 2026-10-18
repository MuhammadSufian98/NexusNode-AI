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
  const clipRectRef = useRef(null);

  // Discrete state for active nodes (only updates when nodes toggle, avoiding 60-120 fps re-renders)
  const [activeNodes, setActiveNodes] = useState({
    node1: false,
    node2: false,
    node3: false,
    node4: false,
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  useEffect(() => {
    let d1 = 0.10;
    let d2 = 0.38;
    let d3 = 0.62;
    let d4 = 0.82;

    if (pathRef.current) {
      const totalLen = pathRef.current.getTotalLength();
      const getDistAtX = (targetX) => {
        let low = 0;
        let high = totalLen;
        for (let i = 0; i < 24; i++) {
          const mid = (low + high) * 0.5;
          const pt = pathRef.current.getPointAtLength(mid);
          if (pt.x < targetX) low = mid;
          else high = mid;
        }
        return (low + high) * 0.5;
      };

      d1 = getDistAtX(140) / totalLen;
      d2 = getDistAtX(520) / totalLen;
      d3 = getDistAtX(840) / totalLen;
      d4 = getDistAtX(1160) / totalLen;
    }

    let animationFrame;
    const CYCLE_DURATION = 10000;
    let startTime = performance.now();
    let prevStates = "";

    const updateLoop = (now) => {
      if (document.visibilityState === "hidden") {
        animationFrame = requestAnimationFrame(updateLoop);
        return;
      }

      const elapsed = (now - startTime) % CYCLE_DURATION;
      const t = elapsed / CYCLE_DURATION;

      let head = 0;
      let tail = 0;

      if (t < 0.60) {
        head = t / 0.60;
        tail = 0;
      } else if (t < 0.78) {
        head = 1;
        tail = 0;
      } else {
        head = 1;
        tail = (t - 0.78) / 0.22;
      }

      if (clipRectRef.current) {
        const xPos = tail * 1400;
        const wVal = Math.max(0, head - tail) * 1400;
        clipRectRef.current.setAttribute("x", xPos.toFixed(1));
        clipRectRef.current.setAttribute("width", wVal.toFixed(1));
      }

      const n1 = head >= d1 && tail < d1;
      const n2 = head >= d2 && tail < d2;
      const n3 = head >= d3 && tail < d3;
      const n4 = head >= d4 && tail < d4;
      const s1 = head >= d2 + 0.02;
      const s2 = head >= d2 + 0.05;
      const s3 = head >= d2 + 0.08;
      const s4 = head >= d2 + 0.11;

      const stateKey = `${n1}${n2}${n3}${n4}${s1}${s2}${s3}${s4}`;
      if (stateKey !== prevStates) {
        prevStates = stateKey;
        setActiveNodes({
          node1: n1,
          node2: n2,
          node3: n3,
          node4: n4,
          step1: s1,
          step2: s2,
          step3: s3,
          step4: s4,
        });
      }

      animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const {
    node1: isNode1Active,
    node2: isNode2Active,
    node3: isNode3Active,
    node4: isNode4Active,
    step1: step1Done,
    step2: step2Done,
    step3: step3Done,
    step4: step4Done,
  } = activeNodes;

  return (
    <section className="relative w-full min-h-screen bg-[var(--color-canvas)]/40 text-[var(--color-text-primary)] overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif] pt-8 sm:pt-12 pb-20 sm:pb-24 select-none transition-colors duration-200">
      {/* 1. PROGRESSIVE FLOW PIPELINE */}
      <div className="hidden lg:block relative w-full max-w-[1400px] mx-auto overflow-visible mb-6" style={{ contain: "layout style" }}>
        <svg viewBox="0 0 1400 340" shapeRendering="geometricPrecision" className="w-full h-auto overflow-visible pointer-events-none">
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
                ref={clipRectRef}
                x="0"
                y="0"
                width="0"
                height="340"
              />
            </clipPath>
          </defs>

          {/* BASE STATIC TRACK */}
          <path
            ref={pathRef}
            d="M 0 44 L 420 44 C 470 44, 450 124, 500 124 L 1400 124"
            stroke="var(--color-border)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* PROGRESSIVE COLORED STROKE */}
          <path
            d="M 0 44 L 420 44 C 470 44, 450 124, 500 124 L 1400 124"
            stroke={`url(#grad-${gradId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            clipPath={`url(#clip-${gradId})`}
          />

          {/* NODE 1: ASK AGENT (x = 70, path y = 44) */}
          <foreignObject
            x="70"
            y="28"
            width="320"
            height="290"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <div
                className={`inline-flex items-center h-8 px-3 rounded-full border transition-[border-color,background-color,color,box-shadow] duration-200 transform-gpu ${
                  isNode1Active
                    ? "bg-[var(--color-surface)] border-[var(--color-main)] text-[var(--color-main)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors duration-150 ${
                    isNode1Active
                      ? "text-[var(--color-main)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence initial={false}>
                  {isNode1Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap overflow-hidden pl-2 pr-1"
                    >
                      Ask Agent
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 w-72 h-[130px]">
                <AnimatePresence>
                  {isNode1Active && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        transform: "translateY(-10px) scale(0.96)",
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        transform: "translateY(0px) scale(1)",
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        transform: "translateY(-6px) scale(0.97)",
                        filter: "blur(2px)",
                      }}
                      style={{ transformOrigin: "top left" }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="relative p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-main)]/20 shadow-xl flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-main)]/20 rotate-45" />
                      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-main)]">
                          Prompt Input
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                          Memory Layout
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed font-normal my-auto">
                        Synthesize chapter memory structure and build an active recall exam card.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs">
                        <span className="text-[var(--color-text-muted)]">
                          Target: <span className="text-[var(--color-text-primary)] font-medium">waitegoos.pdf</span>
                        </span>
                        <ArrowUpRight size={14} className="text-[var(--color-main)]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>

          {/* NODE 2: AGENT WORKFLOW (x = 480, path y = 124) */}
          <foreignObject
            x="480"
            y="108"
            width="320"
            height="290"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <div
                className={`inline-flex items-center h-8 px-3 rounded-full border transition-[border-color,background-color,color,box-shadow] duration-200 transform-gpu ${
                  isNode2Active
                    ? "bg-[var(--color-surface)] border-[var(--color-mid)] text-[var(--color-mid)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors duration-150 ${
                    isNode2Active
                      ? "text-[var(--color-mid)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence initial={false}>
                  {isNode2Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap overflow-hidden pl-2 pr-1"
                    >
                      Agent Workflow
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 w-72 h-[150px]">
                <AnimatePresence>
                  {isNode2Active && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        transform: "translateY(-10px) scale(0.96)",
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        transform: "translateY(0px) scale(1)",
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        transform: "translateY(-6px) scale(0.97)",
                        filter: "blur(2px)",
                      }}
                      style={{ transformOrigin: "top left" }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="relative p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-mid)]/20 shadow-xl flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-mid)]/20 rotate-45" />
                      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-mid)]">
                          Pipeline Run
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                          {step4Done ? "Complete" : "Processing"}
                        </span>
                      </div>
                      <div className="space-y-2 py-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={step1Done ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-muted)]"}>Extract Document Context</span>
                          {step1Done && <Check size={14} className="text-[var(--color-mid)]" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={step2Done ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-muted)]"}>Redact Patterns</span>
                          {step2Done && <Check size={14} className="text-[var(--color-mid)]" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={step4Done ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-muted)]"}>Vector Chunking & Citations</span>
                          {step4Done && <Check size={14} className="text-[var(--color-mid)]" />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>

          {/* NODE 3: AI DECISIONING (x = 790, path y = 124) */}
          <foreignObject
            x="790"
            y="108"
            width="320"
            height="290"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <div
                className={`inline-flex items-center h-8 px-3 rounded-full border transition-[border-color,background-color,color,box-shadow] duration-200 transform-gpu ${
                  isNode3Active
                    ? "bg-[var(--color-surface)] border-[var(--color-highlight)] text-[var(--color-highlight)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors duration-150 ${
                    isNode3Active
                      ? "text-[var(--color-highlight)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence initial={false}>
                  {isNode3Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap overflow-hidden pl-2 pr-1"
                    >
                      AI Decisioning
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 w-72 h-[150px]">
                <AnimatePresence>
                  {isNode3Active && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        transform: "translateY(-10px) scale(0.96)",
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        transform: "translateY(0px) scale(1)",
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        transform: "translateY(-6px) scale(0.97)",
                        filter: "blur(2px)",
                      }}
                      style={{ transformOrigin: "top left" }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="relative p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-highlight)]/20 shadow-xl flex flex-col justify-between h-full transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-highlight)]/20 rotate-45" />
                      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
                          Decision Metrics
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                          Verified
                        </span>
                      </div>
                      <div className="space-y-2 py-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Chunk Match Similarity</span>
                          <span className="font-semibold text-[var(--color-highlight)]">0.941</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Confidence Score</span>
                          <span className="font-semibold text-[var(--color-text-primary)]">High</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-muted)]">Engine Model</span>
                          <span className="font-semibold text-[var(--color-text-primary)]">Groq 70B</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>

          {/* NODE 4: PERSONALIZED OUTPUT (x = 1070, path y = 124) */}
          <foreignObject
            x="1070"
            y="108"
            width="320"
            height="320"
            className="overflow-visible pointer-events-auto"
          >
            <div className="flex flex-col items-start">
              <div
                className={`inline-flex items-center h-8 px-3 rounded-full border transition-[border-color,background-color,color,box-shadow] duration-200 transform-gpu ${
                  isNode4Active
                    ? "bg-[var(--color-surface)] border-[var(--color-main)] text-[var(--color-main)] shadow-md shadow-[var(--color-glow)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-colors duration-150 ${
                    isNode4Active
                      ? "text-[var(--color-main)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <AnimatePresence initial={false}>
                  {isNode4Active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap overflow-hidden pl-2 pr-1"
                    >
                      Personalized Output
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 w-72">
                <AnimatePresence>
                  {isNode4Active && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        transform: "translateY(-10px) scale(0.96)",
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        transform: "translateY(0px) scale(1)",
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        transform: "translateY(-6px) scale(0.97)",
                        filter: "blur(2px)",
                      }}
                      style={{ transformOrigin: "top left" }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="relative p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-main)]/20 shadow-xl flex flex-col gap-3 transform-gpu will-change-transform"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-surface)] border-t border-l border-[var(--color-main)]/20 rotate-45" />
                      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-main)]">
                          Synthesized Artifact
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                          Card Ready
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-main)]">
                          Exam Recall Card
                        </span>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                          Row-Major Offset Mapping
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          Compiler Construction • Page 137
                        </p>
                      </div>

                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] hover:opacity-95 active:scale-[0.98] text-white font-semibold text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Inspect in Workspace</span>
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Mobile & Tablet Stepper */}
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
