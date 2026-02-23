"use client";

import React, { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileQuestion,
  FileText,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  ChevronRight,
  MessageSquare,
  Upload,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGlobal } from "@/context/globalContext";

const ActivityChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" debounce={50}>
    <BarChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="day"
        axisLine={false}
        tickLine={false}
        fontSize={9}
        fontWeight={800}
        stroke="#94a3b8"
        dy={10}
      />
      <YAxis hide domain={[0, "auto"]} />
      <Tooltip
        cursor={{ fill: "#f8fafc" }}
        contentStyle={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
      />
      <Bar dataKey="q" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={10} />
      <Bar dataKey="d" fill="#475569" radius={[4, 4, 0, 0]} barSize={10} />
    </BarChart>
  </ResponsiveContainer>
));
ActivityChart.displayName = "ActivityChart";

export default function OverviewView() {
  const { overviewData, documents, setActiveSection, handleFileUpload } =
    useGlobal();

  const mockWeeklyData = useMemo(
    () => [
      { day: "Mon", q: 45, d: 2 },
      { day: "Tue", q: 52, d: 5 },
      { day: "Wed", q: 38, d: 3 },
      { day: "Thu", q: 65, d: 8 },
      { day: "Fri", q: 48, d: 4 },
      { day: "Sat", q: 24, d: 1 },
      { day: "Sun", q: 15, d: 1 },
    ],
    [],
  );

  const categories = useMemo(
    () => [
      { name: "Technical", value: 45 },
      { name: "Legal", value: 30 },
      { name: "Research", value: 25 },
    ],
    [],
  );

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="h-full max-h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden p-1 pb-8 select-none">
      {/* 1. Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          {
            icon: FileQuestion,
            label: "Questions",
            value: "1,284",
            change: "+12%",
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            icon: FileText,
            label: "Docs",
            value: overviewData.docsIndexed || "24",
            change: "+3",
            color: "text-slate-700",
            bg: "bg-slate-100",
          },
          {
            icon: Zap,
            label: "Latency",
            value: "1.8s",
            change: "-0.2s",
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            icon: TrendingUp,
            label: "Accuracy",
            value: "96.2%",
            change: "+1.5%",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
            className="relative bg-white/70 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.03),inset_-1px_-1px_4px_rgba(255,255,255,0.7)]"
          >
            <div className="flex items-center justify-between mb-1">
              <div className={`p-1.5 ${stat.bg} rounded-xl shadow-inner`}>
                <stat.icon size={14} className={stat.color} />
              </div>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${stat.change.startsWith("+") || stat.change.startsWith("-0") ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-lg font-black text-slate-900 leading-tight">
              {stat.value}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 2. Middle Section: Charts */}
      <div className="flex-1 min-h-0 grid lg:grid-cols-2 gap-4">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-4xl shadow-xl flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">
              Neural Traffic
            </h3>
            <BarChart3 size={14} className="text-rose-600" />
          </div>
          <div className="flex-1 w-full min-h-0 relative">
            {/* Added relative and min-h-0 to parent of ResponsiveContainer to stop flickering */}
            <ActivityChart data={mockWeeklyData} />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-4xl shadow-xl flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">
              Intelligence Mix
            </h3>
            <PieChart size={14} className="text-rose-600" />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
            {categories.map((cat, i) => (
              <div key={cat.name} className="px-1">
                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase mb-1">
                  <span>{cat.name}</span>
                  <span>{cat.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full shadow-inner overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="h-full bg-linear-to-r from-rose-600 to-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 3. Bottom Row */}
      <div className="h-[35%] min-h-40 grid lg:grid-cols-12 gap-4 shrink-0 lg:shrink">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-8 bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-4xl shadow-xl flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Vault Activity
            </h3>
            <button
              onClick={() => setActiveSection("documents")}
              className="text-rose-600 hover:scale-110 transition-transform p-1"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {documents?.slice(0, 5).map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white transition-colors"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm text-rose-600">
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 truncate uppercase">
                      {doc.name}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      {doc.size || "1.2MB"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-4 bg-slate-900 rounded-4xl p-4 shadow-2xl flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-600/20 blur-[50px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <button
              onClick={() => setActiveSection("chat")}
              className="flex items-center gap-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/5 transition-all group active:scale-95"
            >
              <div className="p-2 bg-linear-to-br from-rose-500 to-orange-500 rounded-lg shadow-lg">
                <MessageSquare size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase text-white tracking-widest">
                New Synthesis
              </span>
            </button>

            <label className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all cursor-pointer active:scale-95">
              <div className="p-2 bg-slate-800 rounded-lg border border-white/10">
                <Upload size={14} className="text-rose-500" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
                Ingest PDF
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-rose-500 animate-pulse" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">
                Sync Optimal
              </span>
            </div>
            <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-white">
              18{" "}
              <span className="text-[8px] text-slate-500 italic ml-1">RQ</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
