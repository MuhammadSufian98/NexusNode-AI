"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Database,
  FileCheck2,
  Lock,
  Workflow,
  Search,
} from "lucide-react";

const FEATURES = [
  {
    badge: "Engine Speed",
    title: "Instant Neural Chunking",
    subtitle: "380ms end-to-end vector ingest",
    description:
      "Tokenizes 400+ page syllabi, OCR scans, and research papers in seconds, structuring raw text directly into 512-dim in-memory embeddings.",
    icon: Zap,
    metric: "0.38s",
    metricLabel: "Parse Latency",
    accent: "text-amber-500",
    borderGlow: "hover:border-amber-500/40",
    bgTint: "group-hover:bg-amber-500/5",
    visualType: "speed",
  },
  {
    badge: "Truth Locality",
    title: "1:1 Grounded Verifications",
    subtitle: "0% synthetic hallucinations",
    description:
      "Every generated formula, proof, and answer pins backward to exact line, paragraph, and page coordinates with verifiable source citations.",
    icon: ShieldCheck,
    metric: "100%",
    metricLabel: "Citation Match",
    accent: "text-emerald-500",
    borderGlow: "hover:border-emerald-500/40",
    bgTint: "group-hover:bg-emerald-500/5",
    visualType: "grounding",
  },
  {
    badge: "Privacy Architecture",
    title: "Isolated Local Context",
    subtitle: "Zero public training loops",
    description:
      "Enterprise-grade AES-256 encrypted memory boundary. Uploaded course materials remain transient and never leak to frontier training sets.",
    icon: Lock,
    metric: "BYOK",
    metricLabel: "AES-256 Vault",
    accent: "text-rose-500",
    borderGlow: "hover:border-rose-500/40",
    bgTint: "group-hover:bg-rose-500/5",
    visualType: "security",
  },
];

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative z-10 w-full py-24 lg:py-36 bg-[var(--color-canvas)] select-none border-b border-[var(--color-border)] overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif]"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 lg:pb-20 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200/80 bg-rose-50/60 mb-5 text-rose-600 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Core Architectural Primitives</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-medium tracking-tight text-slate-950 leading-[1.08]">
              Engineered for absolute rigor, <br />
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
                not superficial chat.
              </span>
            </h2>
          </div>

          <p className="max-w-md text-slate-600 font-normal leading-relaxed text-sm sm:text-base">
            NexusNode AI eliminates standard retrieval bottlenecks by decoupling
            raw file parsing from live multimodal inference engines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-12 sm:pt-16">
          {FEATURES.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const IconComponent = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 bg-white border border-slate-200/90 shadow-xs cursor-pointer transition-all duration-500 overflow-hidden ${item.borderGlow} ${item.bgTint}`}
    >
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between pb-8">
          <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/70">
            {item.badge}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-45">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="relative w-full h-36 rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-8 flex flex-col justify-between overflow-hidden">
          {item.visualType === "speed" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-200/70 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Workflow size={13} className="text-amber-500" /> Token
                  Pipeline
                </span>
                <span>512-dim</span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <motion.div
                    animate={hovered ? { x: ["-100%", "100%"] } : { x: "0%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "linear",
                    }}
                    className="w-1/2 h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Chunking 418pp</span>
                  <span className="text-amber-600 font-bold">
                    100% In-Memory
                  </span>
                </div>
              </div>
            </div>
          )}

          {item.visualType === "grounding" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-200/70 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <FileCheck2 size={13} className="text-emerald-500" /> Source
                  Match
                </span>
                <span className="text-emerald-600 font-bold">0.941 Cosine</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                <p className="text-[10px] font-mono text-slate-600 truncate">
                  Ref: Page 14 • Paragraph 3 • Formula (4.2)
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-tight">
                    Deterministic Coordinates
                  </span>
                </div>
              </div>
            </div>
          )}

          {item.visualType === "security" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-200/70 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Database size={13} className="text-rose-500" /> Vault
                  Boundary
                </span>
                <span className="text-rose-600 font-bold">Encrypted</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <Lock size={12} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-slate-800">
                    Ephemeral Session
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    No Training Retention
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <IconComponent size={18} className={item.accent} />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {item.title}
          </h3>
        </div>

        <p className="text-xs font-mono text-slate-400 font-medium mb-4">
          {item.subtitle}
        </p>

        <p className="text-slate-600 text-sm leading-relaxed font-normal">
          {item.description}
        </p>
      </div>

      <div className="relative z-10 pt-8 mt-8 border-t border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {item.metric}
          </span>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {item.metricLabel}
        </span>
      </div>
    </motion.div>
  );
}
