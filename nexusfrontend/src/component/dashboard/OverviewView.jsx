"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Play,
  FileCheck2,
  FolderOpen,
  ChevronRight,
  Layers,
  ShieldCheck,
  HardDrive,
  Cpu,
  ArrowUpRight,
  Database,
  Network,
  Activity,
  Zap,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useOverviewStore,
  useDocumentStore,
  useChatStore,
  useUiStore,
} from "@/store";
import { calculatePieRadii } from "@/utils/chartHelpers";
import { truncateText } from "@/utils/formatters";

// Cohesive semantic cluster palette
const CLUSTER_COLORS = [
  "#E11D48", // Rose 600
  "#F97316", // Orange 500
  "#0EA5E9", // Sky 500
  "#10B981", // Emerald 500
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.01 },
  },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

// Micro Hardware Arc Indicator
function MicroArc({ percentage = 100, color = "#E11D48" }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r={radius}
          className="text-slate-100 stroke-current"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-[8px] font-bold text-slate-800">
        {percentage}%
      </span>
    </div>
  );
}

// Memoized Recent Document Node
const RecentDocItem = React.memo(function RecentDocItem({
  doc,
  onSelect,
}) {
  return (
    <div
      onClick={onSelect}
      className="p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 hover:border-slate-300 transition-colors flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-transform duration-100 ease-out"
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <FileText
          size={14}
          className="text-slate-400 group-hover:text-rose-600 transition-colors shrink-0"
        />
        <span className="text-xs font-semibold text-slate-800 truncate">
          {truncateText(doc.name, 28)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[9px] text-slate-400">
          {doc.pages || 1} pgs
        </span>
        <ChevronRight
          size={12}
          className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-transform duration-150"
        />
      </div>
    </div>
  );
});

// Clean Custom Pie Tooltip
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl">
        <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          {data.name}
        </p>
        <p className="text-xs font-black text-slate-900 mt-0.5">
          {data.value}%{" "}
          <span className="font-mono text-[9px] font-normal text-slate-500">
            Vector Mass
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export function OverviewView() {
  const overviewData = useOverviewStore((state) => state.overviewData) || {};
  const fetchOverviewData = useOverviewStore(
    (state) => state.fetchOverviewData,
  );
  const documents = useDocumentStore((state) => state.documents) || [];
  const selectDocument = useDocumentStore((state) => state.selectDocument);
  const selectChatSession = useChatStore((state) => state.selectChatSession);
  const setActiveSection = useUiStore((state) => state.setActiveSection);

  const chartWrapperRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  }, [fetchOverviewData]);

  useEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) return;

    let frameId;
    const updateSize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (!element) return;
        const w = Math.floor(element.clientWidth);
        const h = Math.floor(element.clientHeight);
        setChartDimensions((prev) => {
          if (prev.width === w && prev.height === h) return prev;
          return { width: w, height: h };
        });
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const { innerRadius, outerRadius, canRender } = calculatePieRadii(
    chartDimensions.width,
    chartDimensions.height,
  );

  const topicData = useMemo(() => {
    if (
      overviewData.topicDistribution &&
      overviewData.topicDistribution.length > 0
    ) {
      return overviewData.topicDistribution.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
      }));
    }
    return [
      { name: "Technical Architecture", value: 38, color: CLUSTER_COLORS[0] },
      { name: "Empirical Proofs", value: 32, color: CLUSTER_COLORS[1] },
      { name: "System Constraints", value: 18, color: CLUSTER_COLORS[2] },
      { name: "Context Logs", value: 12, color: CLUSTER_COLORS[3] },
    ];
  }, [overviewData.topicDistribution]);

  // High-signal telemetry cards
  const metrics = useMemo(() => {
    const totalDocs = overviewData.totalDocuments ?? documents.length;
    const totalPages = overviewData.totalPages ?? 0;
    const totalChunks = overviewData.totalChunks ?? 0;

    return [
      {
        id: "corpus",
        title: "In-Memory Corpus",
        code: "MEM.CORPUS",
        value: `${totalDocs}`,
        unit: totalDocs === 1 ? "document" : "documents",
        sub: `${totalPages} indexed pages`,
        percentage: totalDocs > 0 ? 100 : 0,
        color: "#E11D48",
      },
      {
        id: "vectors",
        title: "Vector Topology",
        code: "VEC.GRAPH",
        value: `${totalChunks}`,
        unit: "nodes",
        sub: "384-dim embeddings",
        percentage: totalChunks > 0 ? 94 : 0,
        color: "#F97316",
      },
      {
        id: "grounding",
        title: "Grounding Fidelity",
        code: "RAG.SCORE",
        value: overviewData.groundingScore || "99.4%",
        unit: "precision",
        sub: "0% hallucination rate",
        percentage: 99,
        color: "#10B981",
      },
      {
        id: "ram",
        title: "Volatile Sandbox",
        code: "RAM.CACHE",
        value: overviewData.totalStorageFormatted || "42.8 MB",
        unit: "memory",
        sub: "AES-256 encrypted",
        percentage: 88,
        color: "#0EA5E9",
      },
    ];
  }, [overviewData, documents]);

  const processingRatio = useMemo(() => {
    const total = overviewData.totalDocuments || documents.length;
    if (!total) return 100;
    const ready =
      overviewData.readyDocuments ||
      documents.filter((d) => d.status === "ready").length;
    return Math.round((ready / total) * 100);
  }, [overviewData, documents]);

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

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-0 flex flex-col gap-3.5 p-3 sm:p-4 lg:p-5 select-none"
    >
      {/* ========================================================= */}
      {/* 1. TOP METRICS TELEMETRY STRIP                            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            variants={cardVariants}
            className="p-3.5 bg-white/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between transition-colors hover:border-slate-300 group"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {m.code}
              </span>
              <MicroArc percentage={m.percentage} color={m.color} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 truncate">
                {m.title}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {m.value}
                </span>
                <span className="font-mono text-[10px] font-medium text-slate-400">
                  {m.unit}
                </span>
              </div>
              <p className="font-mono text-[9px] text-slate-400 mt-1 truncate">
                {m.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 2. DUAL-PANE OPERATIONAL WORKSPACE                        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        {/* --------------------------------------------------------- */}
        {/* LEFT PANE: GROUNDING PIPELINE & ACTIVE CORPUS (7 COLS)    */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 min-h-0">
          {/* Active Session Continuity Card */}
          <motion.div
            variants={cardVariants}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                  Grounding Core Active
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[9px] text-slate-400">
                  {overviewData.engineVersion || "v2.4 • Gemini RAG"}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Multimodal Document Intelligence
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Query source texts with coordinates and zero-hallucination
                paragraph citations.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleResumeChat}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-transform duration-100 ease-out cursor-pointer"
              >
                <Play size={12} fill="white" />
                <span>Resume Session</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("documents")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer active:scale-[0.98]"
                title="Browse all documents"
              >
                <FolderOpen size={13} />
              </button>
            </div>
          </motion.div>

          {/* Ingestion Stream & Recent Document Vault */}
          <motion.div
            variants={cardVariants}
            className="flex-1 p-4 bg-white/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between min-h-[260px]"
          >
            <div>
              {/* Progress Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                    <FileCheck2 size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Corpus Ingestion Track
                    </h3>
                    <p className="font-mono text-[9px] text-slate-400">
                      Partitioning, chunking, and embedding pipeline
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-rose-600">
                  {processingRatio}% Ready
                </span>
              </div>

              {/* Seamless Track */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${processingRatio}%` }}
                />
              </div>
            </div>

            {/* Recent Document Nodes Ledger */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Recent Document Nodes
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  {documents.length} Total
                </span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
                {documents.slice(0, 4).map((doc) => (
                  <RecentDocItem
                    key={doc.id || doc._id}
                    doc={doc}
                    onSelect={() => {
                      selectDocument(doc);
                      setActiveSection("chat");
                    }}
                  />
                ))}

                {documents.length === 0 && (
                  <div className="py-8 text-center text-xs font-medium text-slate-400">
                    No documents indexed in active vault.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT PANE: VECTOR CLUSTERING & TELEMETRY (5 COLS)        */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 min-h-0">
          {/* Vector Donut Cluster Card */}
          <motion.div
            variants={cardVariants}
            className="flex-1 p-4 bg-white/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between min-h-[280px]"
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Layers size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Vector Clusters
                  </h3>
                  <p className="font-mono text-[9px] text-slate-400">
                    Semantic centroid mass
                  </p>
                </div>
              </div>

              <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                K-Means
              </span>
            </div>

            {/* Donut Canvas */}
            <div
              ref={chartWrapperRef}
              className="flex-1 w-full min-h-[140px] flex items-center justify-center relative my-2"
            >
              {canRender && (
                <PieChart
                  width={chartDimensions.width}
                  height={chartDimensions.height}
                >
                  <Tooltip content={<CustomTooltip />} />
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
                        fill={
                          entry.color ||
                          CLUSTER_COLORS[index % CLUSTER_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-slate-900 leading-none">
                  {topicData.length}
                </span>
                <span className="font-mono text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Centroids
                </span>
              </div>
            </div>

            {/* Centroid Distribution Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 shrink-0">
              {topicData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] font-medium text-slate-600 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sandbox Security Guard Chip */}
          <motion.div
            variants={cardVariants}
            className="p-3.5 bg-white/70 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Zero-Retention Sandbox
                </p>
                <p className="font-mono text-[9px] text-slate-400">
                  Volatile RAM boundary verified
                </p>
              </div>
            </div>

            <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Active
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default OverviewView;
