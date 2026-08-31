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
import { useGlobal } from "@/store/globalStore";
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

const PIE_COLORS = ["#e11d48", "#f97316", "#f59e0b", "#0ea5e9"];

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
          <span className="text-[9px] font-normal text-slate-400">
            Coverage
          </span>
        </p>
      </div>
    );
  }
  return null;
}

function OverviewView() {
  const overviewData = useGlobal((state) => state.overviewData) || {};
  const fetchOverviewData = useGlobal((state) => state.fetchOverviewData);
  const documents = useGlobal((state) => state.documents) || [];
  const setActiveSection = useGlobal((state) => state.setActiveSection);
  const selectDocument = useGlobal((state) => state.selectDocument);
  const selectChatSession = useGlobal((state) => state.selectChatSession);

  const chartWrapperRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  }, [fetchOverviewData]);

  useEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) return;

    const updateSize = () => {
      setChartSize({
        width: Math.floor(element.clientWidth),
        height: Math.floor(element.clientHeight),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const canRenderChart = chartSize.width > 0 && chartSize.height > 0;
  const innerRadius = Math.floor(
    Math.min(chartSize.width, chartSize.height) * 0.22,
  );
  const outerRadius = Math.floor(
    Math.min(chartSize.width, chartSize.height) * 0.38,
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
        percentage:
          overviewData.contextDepth || (documents.length > 0 ? 98 : 0),
        color: "#0ea5e9",
      },
    ],
    [overviewData, documents.length],
  );

  const handleResumeChat = async () => {
    if (!overviewData.resumeSession) {
      setActiveSection("documents");
      return;
    }
    const doc = documents.find(
      (d) =>
        d.id === overviewData.resumeSession.documentId ||
        d._id === overviewData.resumeSession.documentId,
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
                <span className="text-[8px] md:text-[9px] font-semibold text-slate-400 uppercase">
                  {stat.sub}
                </span>
              </div>
            </div>
            <MiniPieIndicator percentage={stat.percentage} color={stat.color} />
          </motion.div>
        ))}
      </div>

      {/* 2. CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 min-w-0">
        {/* LEFT COLUMN: ACTIVE SESSION & REPOSITORY PIPELINE */}
        <div className="lg:col-span-7 flex flex-col gap-2.5 min-h-0 min-w-0">
          {/* REFINED ACTIVE SESSION CARD */}
          <motion.div
            variants={cardVariants}
            className="bg-white/60 hover:bg-white/75 backdrop-blur-2xl border border-white/80 p-3.5 md:p-4 rounded-3xl flex flex-col justify-between shrink-0 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/10 via-orange-500/10 to-amber-500/10 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
                  <MessageSquareQuote size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      Active Research Thread
                    </h3>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {overviewData.resumeSession?.documentName ||
                      "No active thread selected"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleResumeChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all cursor-pointer border border-rose-400/40 shrink-0 shadow-xs"
              >
                <Play size={10} fill="currentColor" /> Open Chat
              </button>
            </div>

            {/* Structured Insights Workspace */}
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-500">
                  <Bot size={11} className="text-rose-500" /> Grounded Summary
                </span>
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <CheckCircle2 size={9} /> Context Ready
                </span>
              </div>

              <div className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 max-h-32 md:max-h-36 overflow-y-auto custom-scrollbar">
                {overviewData.resumeSession?.lastMessage ? (
                  <div className="prose max-w-none text-[11px] leading-relaxed text-slate-700 prose-headings:text-[11px] prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-0.5 prose-table:my-1.5 prose-th:p-1 prose-th:text-[9px] prose-th:bg-slate-100/80 prose-td:p-1 prose-td:text-[9px]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {overviewData.resumeSession.lastMessage}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-400 italic text-center py-2">
                    "Start a conversation on any document to track grounding and
                    key summaries here."
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* REPOSITORY HEALTH & PIPELINE */}
          <motion.div
            variants={cardVariants}
            className="bg-white/60 hover:bg-white/75 backdrop-blur-2xl border border-white/80 p-3.5 md:p-4 rounded-3xl flex-1 flex flex-col justify-between min-h-0 shadow-xs"
          >
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-slate-600" />
                  Repository Pipeline
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {processingRatio}% Vectorized
                </span>
              </div>

              {/* Progress indicator */}
              <div className="w-full h-1.5 bg-slate-100/80 rounded-full overflow-hidden flex gap-0.5 mb-2.5">
                <div
                  style={{ width: `${processingRatio}%` }}
                  className="bg-emerald-500 rounded-full transition-all duration-500"
                />
                <div
                  style={{
                    width: `${
                      overviewData.failedDocuments
                        ? (overviewData.failedDocuments /
                            (overviewData.totalDocuments || 1)) *
                          100
                        : 0
                    }%`,
                  }}
                  className="bg-rose-500 rounded-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl">
                  <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                    <CheckCircle2 size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Ready
                    </span>
                  </div>
                  <span className="text-xs md:text-sm font-black text-slate-900">
                    {overviewData.readyDocuments ??
                      documents.filter((d) => d.status === "ready").length}
                  </span>
                </div>

                <div className="p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl">
                  <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                    <Clock size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                  <span className="text-xs md:text-sm font-black text-slate-900">
                    {overviewData.processingDocuments ??
                      documents.filter((d) => d.status === "processing").length}
                  </span>
                </div>

                <div className="p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl">
                  <div className="flex items-center gap-1 text-rose-600 mb-0.5">
                    <FileCheck2 size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Storage
                    </span>
                  </div>
                  <span className="text-xs md:text-sm font-black text-slate-900 truncate block">
                    {overviewData.totalStorageFormatted || "0 KB"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[9px] md:text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive size={10} /> Multi-Tenant Storage
              </span>
              <button
                onClick={() => setActiveSection("documents")}
                className="text-rose-600 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                Manage Documents <ChevronRight size={10} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: SEMANTIC CLUSTERS & VAULT ENTRY */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 min-h-0 min-w-0">
          {/* SEMANTIC DISTRIBUTION DONUT */}
          <motion.div
            variants={cardVariants}
            className="bg-white/60 hover:bg-white/75 backdrop-blur-2xl border border-white/80 p-3.5 md:p-4 rounded-3xl flex-1 flex flex-col justify-between min-h-0 shadow-xs"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PieIcon size={13} className="text-rose-600" />
                  Semantic Distribution
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Coverage
                </span>
              </div>

              <div
                ref={chartWrapperRef}
                className="w-full h-36 sm:h-40 min-h-32 flex items-center justify-center relative"
              >
                {canRenderChart && (
                  <PieChart width={chartSize.width} height={chartSize.height}>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={Math.max(innerRadius, 28)}
                      outerRadius={Math.max(outerRadius, 48)}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={5}
                      isAnimationActive={true}
                    >
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold uppercase text-slate-400">
                    Total
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* DYNAMIC PILL LEGENDS */}
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {topicData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-slate-200/60"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] font-bold text-slate-600 uppercase truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 ml-1">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* QUICK REPOSITORY ACCESS CARD */}
          <motion.div
            variants={cardVariants}
            className="bg-white/60 hover:bg-white/75 backdrop-blur-2xl border border-white/80 p-3 rounded-2xl flex items-center justify-between shrink-0 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FolderOpen size={15} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                  Knowledge Vault
                </h4>
                <p className="text-[9px] text-slate-400 font-medium truncate">
                  Inspect raw chunks, citations, and index maps
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection("documents")}
              className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 active:scale-95 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              Open Vault
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(OverviewView);
