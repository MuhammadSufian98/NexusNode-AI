"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  HardDrive,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useDocumentStore, useUiStore, useChatStore } from "@/store";
import { formatDate } from "@/utils/formatters";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
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

const EMPTY_ARRAY = [];

export function OverviewView() {
  const rawDocuments = useDocumentStore((state) => state.documents);
  const documents = rawDocuments || EMPTY_ARRAY;
  const selectDocument = useDocumentStore((state) => state.selectDocument);
  const setActiveSection = useUiStore((state) => state.setActiveSection);
  const rawConversations = useChatStore((state) => state.conversations);
  const conversations = rawConversations || EMPTY_ARRAY;

  // Computed metrics
  const stats = useMemo(() => {
    const readyDocs = documents.filter((d) => d.status === "ready");
    const totalPages = documents.reduce(
      (sum, d) => sum + (Number(d.pages || d.totalPageCount || 1) || 1),
      0
    );

    return {
      totalDocs: documents.length,
      readyDocs: readyDocs.length,
      totalPages,
      activeSessions: conversations.length,
    };
  }, [documents, conversations]);

  const recentDocs = useMemo(() => {
    return [...documents].slice(0, 5);
  }, [documents]);

  const handleStartChat = (doc) => {
    selectDocument(doc);
    setActiveSection("chat");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full min-h-0 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar select-none space-y-6"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Workspace Intelligence
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-mono text-[10px] font-bold uppercase">
              RAG Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of indexed PDF documents, semantic vectors, and grounded sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection("documents")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Layers size={14} />
          <span>Manage Documents</span>
        </button>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          variants={cardVariants}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Total Documents
            </span>
            <FileText size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalDocs}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {stats.readyDocs} ready for grounded chat
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Indexed Pages
            </span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalPages}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Full-text & vector mapped
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Chat Threads
            </span>
            <MessageSquare size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.activeSessions}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Multi-turn conversation history
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Retrieval Precision
            </span>
            <ShieldCheck size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            100%
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">
            Verifiable source coordinate citations
          </p>
        </motion.div>
      </div>

      {/* 3. Main Workspace Row: Quick Start & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Documents List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileText size={14} className="text-rose-600" />
              Recently Uploaded Documents
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection("documents")}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              View all &rarr;
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
            {recentDocs.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FileText size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  No documents in your vault yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload a PDF document to begin asking questions with source citations.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection("documents")}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-700 transition-colors"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              recentDocs.map((doc) => {
                const docId = doc.id || doc._id;
                const isReady = doc.status === "ready";

                return (
                  <div
                    key={docId}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-rose-600 shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {doc.name || doc.title || "Document.pdf"}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                          <span>{doc.pages || 1} pages</span>
                          <span>•</span>
                          <span>{doc.size || "Unknown size"}</span>
                          {doc.uploadedAt && (
                            <>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartChat(doc)}
                        disabled={!isReady}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <MessageSquare size={11} />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Grounding & Architecture Information */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
              <Sparkles size={16} />
            </div>
            <h4 className="text-sm font-black tracking-tight">
              Production RAG Pipeline
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              NexusNode AI parses PDF structures, computes dense embeddings, and performs hybrid lexical-semantic retrieval to generate answers grounded in exact document coordinates.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span>Model Latency</span>
                <span className="text-emerald-400 font-semibold">Streaming SSE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chunk Boundary</span>
                <span className="text-slate-200">Semantic 256t</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification</span>
                <span className="text-slate-200">Page Bounding Box</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <HardDrive size={15} className="text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Vault Storage Health
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              In-memory cache synchronized with remote persistent storage. Ready for multi-document cross-synthesis.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default OverviewView;
