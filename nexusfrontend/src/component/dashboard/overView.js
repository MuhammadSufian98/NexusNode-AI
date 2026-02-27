"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  Shapes,
} from "lucide-react";
import { useGlobal } from "@/context/globalContext";

export default function OverviewView() {
  const { overviewData, documents, setActiveSection, handleFileUpload } =
    useGlobal();

  const cardVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="h-full flex flex-col gap-2 p-1 overflow-hidden max-h-[calc(100vh-140px)] select-none">
      {/* --- 1. TOP ROW: HIGH-VELOCITY METRICS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
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
            val: `${overviewData.contextDepth}%`,
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
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 py-2 px-4 rounded-4xl shadow-sm flex items-center gap-4 group hover:border-rose-200 transition-all"
          >
            <div
              className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {stat.val}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">
                  {stat.sub}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- 2. MIDDLE ROW: NEURAL MAP & SEARCH (LIGHT THEMED) --- */}
      <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-2">
        {/* Global Semantic Search Stage - UPDATED TO LIGHT THEME */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group shadow-xl shadow-slate-200/50"
        >
          {/* Animated Soft Light Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/40 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/30 blur-[80px] rounded-full" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
                <Search className="text-rose-600" size={20} />
              </div>
              <h3 className="text-slate-400 font-black text-xs tracking-[0.2em] uppercase">
                Semantic Explorer
              </h3>
            </div>

            <div className="space-y-2 text-left">
              <h2 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
                Ask across your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-600 to-orange-500">
                  entire knowledge base.
                </span>
              </h2>
            </div>

            <div className="relative max-w-md group/input">
              <input
                placeholder="Querying 12.4k neural chunks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all shadow-inner"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <span className="text-[9px] font-black text-slate-300 border border-slate-200 px-2 py-1 rounded-lg uppercase bg-white">
                  ⌘ K
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Neural Distribution */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
              <Network size={16} className="text-rose-600" /> Topic Clusters
            </h3>
            <Activity size={14} className="text-rose-600 animate-pulse" />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            {[
              {
                name: "Technical Specs",
                score: 85,
                color: "from-rose-600 to-rose-400",
              },
              {
                name: "Legal Analysis",
                score: 62,
                color: "from-orange-500 to-orange-300",
              },
              {
                name: "Research Data",
                score: 45,
                color: "from-slate-400 to-slate-300",
              },
              {
                name: "Financial Audit",
                score: 30,
                color: "from-amber-500 to-amber-300",
              },
            ].map((topic) => (
              <div key={topic.name} className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {topic.name}
                  </span>
                  <span className="text-[10px] font-black text-slate-900">
                    {topic.score}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`h-full bg-linear-to-r ${topic.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- 3. BOTTOM ROW: RECENT ACTIVITY & QUICK ACTIONS --- */}
      <div className="h-[30%] min-h-35 grid lg:grid-cols-12 gap-4 shrink-0">
        {/* Vault Activity */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-8 bg-white border border-slate-200 p-2 px-6 rounded-[2.5rem] shadow-sm flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
              <Activity size={14} /> Neural Pulse
            </h3>
            <button
              onClick={() => setActiveSection("documents")}
              className="text-rose-600 p-1 hover:scale-110 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {documents?.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-4 p-3 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">
                    {doc.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    Indexed 2m ago • {doc.size}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[8px] font-black uppercase">
                    Ready
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Stage */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-4 grid grid-rows-2 gap-3"
        >
          <button
            onClick={() => setActiveSection("chat")}
            className="group bg-linear-to-br from-rose-600 to-orange-500 rounded-4xl py-2 px-4 flex items-center justify-between shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4">
              <Shapes size={80} />
            </div>
            <div className="relative z-10 flex flex-col items-start gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                New Session
              </span>
              <span className="text-sm font-black uppercase tracking-widest">
                Synthesis
              </span>
            </div>
            <MessageSquare size={24} className="relative z-10" />
          </button>

          <label className="group bg-white border-2 border-dashed border-slate-200 rounded-4xl py-2 px-4 flex items-center justify-between hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer overflow-hidden relative">
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Knowledge Asset
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-slate-800">
                Ingest PDF
              </span>
            </div>
            <Upload
              size={24}
              className="text-slate-400 group-hover:text-rose-600 transition-colors"
            />
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </motion.div>
      </div>
    </div>
  );
}
