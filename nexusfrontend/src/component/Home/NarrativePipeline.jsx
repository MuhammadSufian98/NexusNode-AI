"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Terminal as TerminalIcon,
  RefreshCw,
} from "lucide-react";

export default function NarrativePipeline() {
  const router = useRouter();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 95%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0008,
  });

  const label1Progress = useTransform(smoothProgress, [0.02, 0.1], [0.25, 1]);
  const sec1Progress = useTransform(smoothProgress, [0.04, 0.16], [0.35, 1]);

  const label2Progress = useTransform(smoothProgress, [0.22, 0.32], [0.25, 1]);
  const sec2Progress = useTransform(smoothProgress, [0.25, 0.4], [0.35, 1]);

  const label3Progress = useTransform(smoothProgress, [0.48, 0.58], [0.25, 1]);
  const sec3Progress = useTransform(smoothProgress, [0.5, 0.66], [0.35, 1]);

  const label4Progress = useTransform(smoothProgress, [0.68, 0.78], [0.25, 1]);
  const sec4Progress = useTransform(smoothProgress, [0.7, 0.84], [0.35, 1]);

  const ctaProgress = useTransform(smoothProgress, [0.85, 0.96], [0.35, 1]);

  const [activeCardTab, setActiveCardTab] = useState("front");

  return (
    <section
      id="pipeline-overview"
      ref={containerRef}
      className="relative z-20 w-full py-24 sm:py-32 bg-[var(--color-canvas)] text-[var(--color-text-primary)] transition-colors duration-200 overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif]"
    >
      <div className="max-w-4xl mx-auto px-6 text-center mb-24 lg:mb-32">
        <h2 className="text-4xl sm:text-6xl font-medium tracking-tight text-slate-950 leading-[1.08]">
          From Raw Scanned Chaos to <br />
          <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
            Verified, 1:1 Active Mastery.
          </span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Follow the continuous trajectory as NexusNode AI reads multimodal
          notes, builds high-dimensional semantic vector maps, and synthesizes
          100% hallucination-free recall assets.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 flex flex-col gap-10">
        <div className="relative w-full rounded-[2.5rem] border border-slate-200/90 bg-white/40 p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 500"
            >
              <path
                d="M 40 40 L 960 40 Q 980 40 980 60 L 980 440 Q 980 460 960 460 L 40 460"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.path
                d="M 40 40 L 960 40 Q 980 40 980 60 L 980 440 Q 980 460 960 460 L 40 460"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  pathLength: useTransform(smoothProgress, [0.0, 0.2], [0, 1]),
                }}
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-10">
            <motion.div
              style={{ opacity: label1Progress }}
              className="inline-flex items-center px-4 py-1 rounded-full border border-slate-200 bg-white shadow-2xs"
            >
              <span className="font-mono text-xs font-semibold text-rose-600 uppercase tracking-wide">
                Ingesting signals
              </span>
            </motion.div>
            <span className="font-mono text-xs text-slate-400">
              01 // Input
            </span>
          </div>

          <motion.div
            style={{ opacity: sec1Progress }}
            className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                The Natural Intent Prompt
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Query across handwritten lecture scans, mathematical proofs, and
                unsearchable 400-page course packets with zero pre-formatting.
              </p>
              <div className="pt-2 flex gap-4 text-xs font-mono text-slate-400">
                <span>Latency: 14ms</span>
                <span>•</span>
                <span>Sources: 2 PDFs</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 font-mono text-xs text-slate-400">
                  <span>INPUT_BUFFER</span>
                  <span>512-DIM VECTOR</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-mono">
                  &quot;Can you extract the derivation of equation 4.2 from the
                  Week 7 scan and verify if it matches page 118?&quot;
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative w-full rounded-[2.5rem] border border-slate-200/90 bg-white/40 p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 500"
            >
              <path
                d="M 960 40 L 40 40 Q 20 40 20 60 L 20 440 Q 20 460 40 460 L 960 460"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.path
                d="M 960 40 L 40 40 Q 20 40 20 60 L 20 440 Q 20 460 40 460 L 960 460"
                fill="none"
                stroke="#F97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  pathLength: useTransform(smoothProgress, [0.2, 0.42], [0, 1]),
                }}
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-10">
            <span className="font-mono text-xs text-slate-400">
              02 // Coordinates
            </span>
            <motion.div
              style={{ opacity: label2Progress }}
              className="inline-flex items-center px-4 py-1 rounded-full border border-slate-200 bg-white shadow-2xs"
            >
              <span className="font-mono text-xs font-semibold text-orange-600 uppercase tracking-wide">
                Parsing vectors
              </span>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: sec2Progress }}
            className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 font-mono text-xs text-slate-400">
                  <span>BOUNDING_BOX: [142, 388, 280, 42]</span>
                  <span>COSINE 0.941</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase block">
                    Matched Target // WaiteGoos_p118
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    disp = sum((i_j - low_j) * d_j)
                  </p>
                  <p className="text-slate-500 text-xs">
                    Row-Major Multi-Dimensional Array Offset
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-5 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                Spatial Chunking & Indexing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Formulas, margin annotations, and diagrams are isolated with
                sub-millimeter 2D bounding boxes and projected into unified
                vector space.
              </p>
              <div className="pt-2 flex gap-4 text-xs font-mono text-slate-400">
                <span>Top-K: 4</span>
                <span>•</span>
                <span>Accuracy: 98.4%</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative w-full rounded-[2.5rem] border border-slate-200/90 bg-white/40 p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 500"
            >
              <path
                d="M 40 40 L 960 40 Q 980 40 980 60 L 980 440 Q 980 460 960 460 L 40 460"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.path
                d="M 40 40 L 960 40 Q 980 40 980 60 L 980 440 Q 980 460 960 460 L 40 460"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  pathLength: useTransform(
                    smoothProgress,
                    [0.42, 0.68],
                    [0, 1],
                  ),
                }}
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-10">
            <motion.div
              style={{ opacity: label3Progress }}
              className="inline-flex items-center px-4 py-1 rounded-full border border-slate-200 bg-white shadow-2xs"
            >
              <span className="font-mono text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Grounding proof
              </span>
            </motion.div>
            <span className="font-mono text-xs text-slate-400">
              03 // Verification
            </span>
          </div>

          <motion.div
            style={{ opacity: sec3Progress }}
            className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
                Multi-Agent Proof Verification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Before delivering answers, reasoning supervisor agents
                cross-examine claims against original textbook proofs to enforce
                strict factual grounding.
              </p>
              <div className="pt-2 flex gap-4 text-xs font-mono text-slate-400">
                <span>Hallucination: 0%</span>
                <span>•</span>
                <span>Audit: Strict 1:1</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <TerminalIcon size={13} className="text-emerald-400" />
                    AGENT_SYNTHESIZER
                  </span>
                  <span className="text-emerald-400">VERIFIED</span>
                </div>
                <div className="space-y-3 font-mono text-xs leading-relaxed text-slate-300">
                  <p>
                    Equation 4.2 denotes the row-major memory offset bounded by{" "}
                    <code className="text-amber-300 font-bold">
                      disp = sum((i_j - low_j) * d_j)
                    </code>
                    .
                  </p>
                  <p className="text-slate-400">
                    Cross-referenced against Lecture 7 scans. Coordinate proof
                    Ref 82.a (page 118) matches lower bound parameters.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative w-full rounded-[2.5rem] border border-slate-200/90 bg-white/40 p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 500"
            >
              <path
                d="M 960 40 L 40 40 Q 20 40 20 60 L 20 440 Q 20 460 40 460 L 960 460"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.path
                d="M 960 40 L 40 40 Q 20 40 20 60 L 20 440 Q 20 460 40 460 L 960 460"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  pathLength: useTransform(
                    smoothProgress,
                    [0.65, 0.88],
                    [0, 1],
                  ),
                }}
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-10">
            <span className="font-mono text-xs text-slate-400">
              04 // Synthesis
            </span>
            <motion.div
              style={{ opacity: label4Progress }}
              className="inline-flex items-center px-4 py-1 rounded-full border border-slate-200 bg-white shadow-2xs"
            >
              <span className="font-mono text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Active recall
              </span>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: sec4Progress }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full"
          >
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 font-mono text-xs text-slate-400">
                  <span>FLASHCARD #402</span>
                  <span>MASTERY 94%</span>
                </div>
                <p className="text-sm font-mono text-slate-900 leading-relaxed mb-6">
                  {activeCardTab === "front"
                    ? "What is the general formula for row-major array offset calculation in n-dimensions?"
                    : "disp = sum_{j=1}^n (i_j - low_j) * d_j (Waite & Goos, p. 118)"}
                </p>
              </div>
              <button
                onClick={() =>
                  setActiveCardTab(activeCardTab === "front" ? "back" : "front")
                }
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-mono font-medium text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>
                  {activeCardTab === "front"
                    ? "Reveal formula"
                    : "Show concept"}
                </span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 font-mono text-xs text-slate-400">
                  <span>ACTIVE_DRILL</span>
                  <span>COMPILER PREP</span>
                </div>
                <p className="text-sm font-mono text-slate-900 leading-relaxed mb-4">
                  In a 3D array A[1..5, 1..10, 1..20], what is the multiplier
                  d_2 for row-major mapping?
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    d_2 = 20 (Elements in dim 3)
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block pt-4">
                Verified against course syllabus
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: ctaProgress }}
          className="relative z-10 w-full max-w-4xl mx-auto rounded-3xl p-10 sm:p-16 border border-slate-200 bg-white text-center shadow-sm mt-8"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-slate-950 leading-tight">
              Turn your buried documents into <br />
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
                instant active mastery.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Synthesize 100+ pages in under 3 seconds with mathematically
              grounded recall.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowUpRight size={16} />
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
              >
                Explore Vaults
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
