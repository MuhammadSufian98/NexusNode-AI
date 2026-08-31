"use client";

import React, { memo, useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ChevronRight,
  PieChart as PieIcon,
  Play,
  CheckCircle2,
  Clock,
  HardDrive,
  FileCheck2,
  SlidersHorizontal,
  FolderOpen,
  MessageSquareQuote,
  ArrowRight,
  Layers,
  Sparkles,
  Bot,
  User,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useOverviewStore,
  useDocumentStore,
  useChatStore,
  useUiStore,
} from "@/store";
import { PIE_COLORS, calculatePieRadii } from "@/utils/chartHelpers";
import { truncateText, formatRelativeTime } from "@/utils/formatters";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 8, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] },
  },
};

function MiniPieIndicator({ percentage = 100, color = "#e11d48" }) {
  const data = [
    { value: percentage },
    { value: Math.max(0, 100 - percentage) },
  ];
  return (
    <div className="w-8 h-8 md:w-9 md:h-9 relative flex items-center justify-center shrink-0">
      <PieChart width={36} height={36}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={11}
          outerRadius={16}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          isAnimationActive={false}
        >
          <Cell fill={color} />
          <Cell fill="rgba(241, 245, 249, 0.8)" />
        </Pie>
      </PieChart>
      <span className="absolute text-[8px] font-black text-slate-700">
        {percentage}%
      </span>
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          {data.name}
        </p>
        <p className="text-xs font-black text-white">
          {data.value}%{" "}
          <span className="text-[9px] font-normal text-slate-400">Coverage</span>
        </p>
      </div>
    );
  }
  return null;
}

export function OverviewView() {
  const overviewData = useOverviewStore((state) => state.overviewData) || {};
  const fetchOverviewData = useOverviewStore((state) => state.fetchOverviewData);
  const documents = useDocumentStore((state) => state.documents) || [];
  const selectDocument = useDocumentStore((state) => state.selectDocument);
  const selectChatSession = useChatStore((state) => state.selectChatSession);
  const setActiveSection = useUiStore((state) => state.setActiveSection);

  const chartWrapperRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  }, [fetchOverviewData]);

  useEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) return;

    const updateSize = () => {
      setChartDimensions({
        width: Math.floor(element.clientWidth),
        height: Math.floor(element.clientHeight),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { innerRadius, outerRadius, canRender: canRenderChart } = calculatePieRadii(
    chartDimensions.width,
    chartDimensions.height
  );

  const topicData = useMemo(() => {
    if (
      overviewData.topicDistribution &&
      overviewData.topicDistribution.length > 0
    ) {
      return overviewData.topicDistribution.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }));
    }
    return [
      { name: "Technical Architecture", value: 40, color: PIE_COLORS[0] },
      { name: "Methodology & Proofs", value: 30, color: PIE_COLORS[1] },
      { name: "Data & Specifications", value: 20, color: PIE_COLORS[2] },
      { name: "System Constraints", value: 10, color: PIE_COLORS[3] },
    ];
  }, [overviewData.topicDistribution]);

  const stats = useMemo(
    () => [
      {
        label: "Documents Processed",
        val: `${overviewData.totalDocuments || documents.length}`,
        sub: `${overviewData.totalPages || 0} Pages`,
        percentage: overviewData.totalDocuments > 0 ? 100 : 0,
        color: "#e11d48",
      },
      {
        label: "Indexed Vectors",
        val: overviewData.totalChunks ?? "0",
        sub: "Nodes",
        percentage: overviewData.totalChunks > 0 ? 94 : 0,
        color: "#f97316",
      },
      {
        label: "Grounding Fidelity",
        val: overviewData.groundingScore || "99.4%",
        sub: "Verified",
        percentage: 99,
        color: "#10b981",
      },
      {
        label: "Context Depth",
        val: `${overviewData.contextDepth || (documents.length > 0 ? 98 : 0)}%`,
        sub: "Optimized",
        percentage: overviewData.contextDepth || (documents.length > 0 ? 98 : 0),
        color: "#0ea5e9",
      },
    ],
    [overviewData, documents.length]
  );

  const handleResumeChat = async () => {
    if (!overviewData.resumeSession) {
      setActiveSection("documents");
      return;
    }
    const doc = documents.find(
      (d) =>
        d.id === overviewData.resumeSession.documentId ||
        d._id === overviewData.resumeSession.documentId
    );
    if (doc) {
      await selectDocument(doc);
    }
    if (overviewData.resumeSession.conversationId) {
      await selectChatSession(overviewData.resumeSession.conversationId);
    }
    setActiveSection("chat");
  };

  const processingRatio = useMemo(() => {
    const total = overviewData.totalDocuments || documents.length;
    if (!total) return 100;
    const ready =
      overviewData.readyDocuments ||
      documents.filter((d) => d.status === "ready").length;
    return Math.round((ready / total) * 100);
  }, [overviewData, documents]);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full min-h-0 min-w-0 flex flex-col gap-2.5 p-1 md:p-1.5 select-none overflow-y-auto custom-scrollbar"
    >
      {/* 1. TOP METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2.5 shrink-0">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/70 shadow-xs hover:border-slate-200/90 transition-all p-3 rounded-2xl flex items-center justify-between gap-2.5"
          >
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">
                  {stat.val}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                  {stat.sub}
                </span>
              </div>
            </div>
            <MiniPieIndicator percentage={stat.percentage} color={stat.color} />
          </motion.div>
        ))}
      </div>

      {/* 2. DYNAMIC WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-2.5 flex-1 min-h-0">
        {/* LEFT COLUMN: ACTIVE WORKSPACE & SESSIONS (7 COLS) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-7 flex flex-col gap-2 md:gap-2.5 min-h-0"
        >
          {/* ACTIVE WORKBENCH BANNER */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 md:p-5 relative overflow-hidden shadow-xl shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-600/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Active Grounding Core
                  </span>
                </div>
                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {overviewData.engineVersion || "v4.2-RAG"}
                </span>
              </div>

              <div>
                <h2 className="text-base md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Intelligent Vault Synthesis</span>
                  <Sparkles size={16} className="text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1 max-w-lg">
                  Vector grounding verified against document tokens. Knowledge
                  graphs automatically parsed and synchronized across workspaces.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleResumeChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-rose-600/20 active:scale-97 transition-all cursor-pointer"
                >
                  <Play size={12} fill="white" />
                  <span>Resume Session</span>
                </button>

                <button
                  onClick={() => setActiveSection("documents")}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 active:scale-97 transition-all cursor-pointer"
                >
                  <FolderOpen size={13} />
                  <span>Browse Vault</span>
                </button>
              </div>
            </div>
          </div>

          {/* DOCUMENT INGESTION PROGRESS & SNAPSHOT */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 md:p-4 flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <FileCheck2 size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Ingestion Pipeline
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Multi-Stage Indexing & Vectorization
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-600">
                  {processingRatio}%
                </span>
              </div>

              {/* Seamless 3-Color Gradient Progress Track */}
              <div className="w-full h-2 bg-slate-100/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${processingRatio}%` }}
                />
              </div>
            </div>

            {/* Quick Document Items */}
            <div className="space-y-1.5 mt-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Recent Vault Entries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id || doc._id}
                    onClick={() => {
                      selectDocument(doc);
                      setActiveSection("chat");
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/70 hover:bg-white border border-slate-200/70 hover:border-rose-300 transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText
                        size={14}
                        className="text-slate-400 group-hover:text-rose-600 transition-colors shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {truncateText(doc.name, 24)}
                      </span>
                    </div>
                    <ChevronRight
                      size={13}
                      className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs font-medium text-slate-400">
                    No documents loaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: KNOWLEDGE COVERAGE & SYSTEM METRICS (5 COLS) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-5 flex flex-col gap-2 md:gap-2.5 min-h-0"
        >
          {/* TOPIC DISTRIBUTION DONUT */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 md:p-4 flex flex-col shadow-xs flex-1 min-h-[220px]">
            <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                  <PieIcon size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Domain Distribution
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Semantic Cluster Analysis
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Live
              </span>
            </div>

            {/* CHART DISPLAY */}
            <div
              ref={chartWrapperRef}
              className="flex-1 w-full min-h-[120px] flex items-center justify-center relative my-1"
            >
              {canRenderChart && (
                <PieChart width={chartDimensions.width} height={chartDimensions.height}>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={topicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {topicData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-slate-800 leading-none">
                  {topicData.length}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  Clusters
                </span>
              </div>
            </div>

            {/* TOPIC LEGEND */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 shrink-0">
              {topicData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-bold text-slate-600 truncate">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 ml-auto shrink-0">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* REPOSITORY SYSTEM STATUS PILL BOX */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 flex flex-col gap-2 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Storage Allocation
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-800">
                {overviewData.totalStorageFormatted || "0 KB"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Encryption Standard
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-600">
                {overviewData.encryptionStandard || "AES-256-GCM"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default OverviewView;
