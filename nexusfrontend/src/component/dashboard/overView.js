"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Zap,
  ChevronRight,
  Activity,
  Cpu,
  Box,
  Fingerprint,
  Network,
  Sparkles,
  Shield,
  CheckCircle2,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useGlobal } from "@/store/globalStore";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function OverviewView() {
  const { overviewData, documents, setActiveSection } = useGlobal();

  const topicData = useMemo(
    () => [
      { subject: "Tech Specs", A: 85 },
      { subject: "Legal", A: 62 },
      { subject: "Research", A: 45 },
      { subject: "Finance", A: 30 },
    ],
    [],
  );

  const stats = useMemo(
    () => [
      {
        label: "Neural Index",
        val: overviewData.chunks || "12,402",
        sub: "Chunks",
        icon: Cpu,
        color: "text-rose-600",
        bg: "bg-rose-50",
      },
      {
        label: "Vault Space",
        val: overviewData.spaceUsed || "4.2GB",
        sub: "AES-256",
        icon: Box,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        label: "Context Depth",
        val: `${overviewData.contextDepth || 98}%`,
        sub: "Optimized",
        icon: Fingerprint,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Privacy Shield",
        val: overviewData.maskedPII || "842",
        sub: "Redacted",
        icon: Shield,
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
    ],
    [overviewData],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full h-102.5 flex flex-col gap-3 p-1 select-none bg-slate-50/50 overflow-hidden"
    >
      {/* 1. TOP STATS - FIXED HEIGHT */}
      <div className="grid grid-cols-4 gap-3 h-21.25">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            className="bg-white border border-slate-200 p-3 rounded-3xl shadow-sm flex items-center gap-3 relative overflow-hidden group"
          >
            <div
              className={`p-2 ${stat.bg} ${stat.color} rounded-2xl shrink-0`}
            >
              <stat.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  {stat.val}
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase">
                  {stat.sub}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. SYMMETRIC CORE - FLEX-1 TO FILL REMAINING 464px space */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* LEFT: NEURAL PULSE (VAULT STATUS) */}
        <motion.div
          variants={cardVariants}
          className="bg-white border border-slate-200 rounded-[2.5rem] p-5 shadow-sm flex flex-col relative overflow-hidden group"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-rose-600" /> Neural Pulse
            </h3>
            <button
              onClick={() => setActiveSection("documents")}
              className="text-rose-600 hover:translate-x-1 transition-transform"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {documents?.slice(0, 3).map((doc, idx) => (
              <div
                key={doc.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border border-transparent transition-all ${
                  doc.status === "redacting"
                    ? "bg-slate-50/50 opacity-80"
                    : "bg-slate-50 hover:bg-white hover:border-slate-100 cursor-pointer"
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${doc.status === "redacting" ? "bg-amber-100 text-amber-600" : "bg-white text-rose-600 shadow-sm"}`}
                >
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-800 truncate uppercase">
                    {doc.name}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">
                    {doc.size}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${
                    doc.status === "redacting"
                      ? "bg-amber-50 text-amber-600 animate-pulse"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {doc.status === "redacting" ? (
                    <Shield size={9} />
                  ) : (
                    <CheckCircle2 size={9} />
                  )}
                  {doc.status === "redacting" ? "Shielding" : "Secure"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: TOPIC CLUSTERS (SEMANTIC MAP) */}
        <motion.div
          variants={cardVariants}
          className="bg-white border border-slate-200 rounded-[2.5rem] p-5 shadow-sm flex flex-col relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
              <Network size={14} className="text-rose-600" /> Topic Clusters
            </h3>
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topicData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 900 }}
                />
                <Radar
                  name="Cluster"
                  dataKey="A"
                  stroke="#e11d48"
                  fill="#e11d48"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {topicData.map((item) => (
              <div
                key={item.subject}
                className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  {item.subject}
                </span>
                <span className="text-[10px] font-black text-slate-900">
                  {item.A}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
