"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Zap,
  ChevronRight,
  MessageSquare,
  Upload,
  Activity,
  Cpu,
  Fingerprint,
  Network,
  Search,
  Box,
  Shapes,
  Sparkles,
  Database,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useGlobal } from "@/context/globalContext";

// Animation Constants
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function OverviewView() {
  const { overviewData, documents, setActiveSection, handleFileUpload } =
    useGlobal();

  // Memoize static data to prevent re-calculations
  const topicData = useMemo(
    () => [
      { subject: "Tech Specs", A: 85, fullMark: 100 },
      { subject: "Legal", A: 62, fullMark: 100 },
      { subject: "Research", A: 45, fullMark: 100 },
      { subject: "Finance", A: 30, fullMark: 100 },
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
        label: "Engine State",
        val: "v4.2",
        sub: "Stable",
        icon: Zap,
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
      className="w-full flex flex-col gap-4 p-2 md:p-4 select-none bg-slate-50/50"
    >
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 p-3 md:p-4 rounded-3xl shadow-sm flex items-center gap-3 md:gap-4 group transition-shadow hover:shadow-md relative overflow-hidden"
          >
            {/* Background Decor Icon */}
            <stat.icon
              size={40}
              className={`absolute -right-2 -bottom-2 opacity-[0.03] ${stat.color}`}
            />

            <div
              className={`p-2 md:p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform shrink-0`}
            >
              <stat.icon size={18} />
            </div>
            <div className="min-w-0 z-10">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm md:text-xl font-black text-slate-900 tracking-tight">
                  {stat.val}
                </span>
                <span className="hidden sm:inline text-[8px] font-bold text-slate-400 uppercase">
                  {stat.sub}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-200 rounded-4xl p-6 md:p-7 flex flex-col justify-center relative overflow-hidden shadow-xl shadow-slate-200/40 group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/20 blur-[80px] rounded-full group-hover:bg-rose-200/30 transition-colors duration-700" />
            <div className="absolute -left-4 -bottom-4 opacity-[0.03] rotate-12">
              <Database size={120} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                  <Search className="text-rose-600" size={16} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-slate-400 font-black text-[9px] tracking-[0.2em] uppercase">
                    Semantic Explorer
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[7px] font-black text-rose-500 uppercase">
                      Live Indexing
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-slate-900 text-2xl md:text-3xl font-black leading-tight">
                Ask across your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-600 to-orange-500">
                  knowledge base.
                </span>
              </h2>

              <div className="relative max-w-sm group/input">
                <input
                  placeholder="Querying 12.4k neural chunks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-40 group-focus-within/input:opacity-100 transition-opacity">
                  <kbd className="text-[9px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                    ⌘
                  </kbd>
                  <kbd className="text-[9px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                    K
                  </kbd>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-200 p-5 rounded-[2.25rem] shadow-sm flex flex-col relative overflow-hidden"
          >
            <div className="absolute right-6 top-6 opacity-[0.05]">
              <Activity size={60} />
            </div>

            <div className="flex justify-between items-center mb-3 relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity size={14} /> Neural Pulse
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, x: 3 }}
                onClick={() => setActiveSection("documents")}
                className="text-rose-600 p-1"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            <div className="space-y-2 relative z-10">
              {documents?.slice(0, 3).map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="group flex items-center gap-4 p-3 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-800 truncate uppercase">
                      {doc.name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      Indexed • {doc.size}
                    </p>
                  </div>
                  <div className="hidden sm:block px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    Ready
                  </div>
                </motion.div>
              ))}
              {!documents?.length && (
                <div className="text-[11px] text-slate-400 py-4 italic">
                  No assets indexed. Ingest a PDF to begin.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-200 rounded-4xl p-5 flex flex-col shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                <Network size={14} className="text-rose-600" /> Topic Clusters
              </h3>
              <div className="flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400 animate-pulse" />
                <Activity size={12} className="text-rose-600" />
              </div>
            </div>

            <div className="w-full h-45 py-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="65%"
                  data={topicData}
                >
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 900 }}
                  />
                  <Radar
                    name="Clustering"
                    dataKey="A"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.4}
                    animationBegin={400}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {topicData.map((item) => (
                <div
                  key={item.subject}
                  className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 hover:bg-white hover:border-rose-100 transition-all cursor-default"
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

          {/* ACTIONS */}
          <motion.div variants={cardVariants} className="grid gap-3">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection("chat")}
              className="group bg-linear-to-br from-rose-600 to-orange-500 rounded-4xl p-5 flex items-center justify-between text-white shadow-lg shadow-rose-200 transition-all relative overflow-hidden"
            >
              <div className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <Shapes size={80} />
              </div>
              <div className="text-left relative z-10">
                <p className="text-[9px] font-black uppercase opacity-70 tracking-widest">
                  Neural Link
                </p>
                <p className="text-lg font-black uppercase tracking-widest">
                  Synthesis
                </p>
              </div>
              <MessageSquare
                size={28}
                className="relative z-10 group-hover:scale-110 transition-transform"
              />
            </motion.button>

            <motion.label
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white border-2 border-dashed border-slate-200 rounded-4xl p-5 flex items-center justify-between hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  Upload Protocol
                </p>
                <p className="text-lg font-black uppercase tracking-widest text-slate-800">
                  Ingest PDF
                </p>
              </div>
              <Upload
                size={28}
                className="text-slate-400 group-hover:text-rose-600 group-hover:-translate-y-0.5 transition-all"
              />
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </motion.label>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
