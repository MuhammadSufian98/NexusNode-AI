"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Network,
  UploadCloud,
  FileUp,
  Loader2,
  X
} from "lucide-react";
import { useDocumentStore, useUiStore, useOverviewStore } from "@/store";
import { formatDate } from "@/utils/formatters";
import API_BASE_URL from "@/lib/apiBaseUrl";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/component/PdfViewer"), {
  ssr: false,
});
const KnowledgeTreeModal = dynamic(
  () => import("@/components/KnowledgeTreeModal"),
  { ssr: false },
);

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 },
  },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const DocumentCard = React.memo(function DocumentCard({
  doc,
  hasTree,
  onOpenPdf,
  onGenerateTree,
  onSelectDoc,
  onDeleteDoc,
  onExpandTier,
}) {
  const [isExpanding, setIsExpanding] = useState(false);
  const docId = doc.id || doc._id;
  const isReady = doc.status === "ready";
  const isFailed = doc.status === "failed";
  const isProcessing = doc.status === "processing";
  const isPartialTier =
    isReady &&
    doc.vectorTier &&
    doc.vectorTier !== "100%" &&
    doc.vectorTier !== "complete";

  const handleExpandTier = async (e) => {
    e.stopPropagation();
    if (isExpanding || !onExpandTier || !docId) return;
    setIsExpanding(true);
    try {
      await onExpandTier(docId);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isReady && docId) {
          onOpenPdf(doc);
        }
      }}
      className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-colors group relative min-h-[178px] ${
        isFailed
          ? "border-rose-200 bg-rose-50/20"
          : "border-slate-200/70 bg-white/40 hover:bg-white hover:border-slate-300 cursor-pointer"
      }`}
    >
      <div>
        {/* Top Row: Icon + Tree Trigger + Status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                isFailed
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-slate-50 border-slate-200 text-slate-700 group-hover:text-rose-600 group-hover:border-rose-200 transition-colors"
              }`}
            >
              <FileText size={16} />
            </div>

            {/* Knowledge Graph Tree Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isReady) return;
                onGenerateTree(docId);
              }}
              disabled={!isReady}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition-transform duration-100 ease-out ${
                hasTree
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
              }`}
              title="Knowledge Graph Tree"
            >
              <Network size={13} />
            </button>
          </div>

          {/* Status Badges */}
          <div>
            {isPartialTier && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase">
                  {doc.vectorTier} Indexed
                </span>
              </div>
            )}
            {!isPartialTier && isReady && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700">
                <CheckCircle2 size={10} />
                <span className="font-mono text-[9px] font-bold uppercase">
                  Ready
                </span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase">
                  Chunking
                </span>
              </div>
            )}
            {isFailed && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                <AlertTriangle size={10} />
                <span className="font-mono text-[9px] font-bold uppercase">
                  Error
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Document Title */}
        <h3
          className="font-bold text-xs text-slate-900 truncate leading-snug group-hover:text-rose-600 transition-colors"
          title={doc.name}
        >
          {doc.name}
        </h3>

        {/* Specs / Metadata */}
        <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] text-slate-400">
          <div className="flex items-center gap-1">
            <FileCheck size={11} />
            <span>{doc.pages || doc.totalPageCount || 1} pgs</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{doc.size || "Unknown"}</span>
          </div>
        </div>

        {/* Tier Expansion Strip for large PDFs */}
        {isPartialTier && (
          <div className="mt-2.5 flex items-center justify-between gap-1.5 p-1.5 bg-slate-50/90 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[9px] font-semibold truncate">
              <span>{doc.indexedPageCount || 0}/{doc.totalPageCount || doc.pages || 1} pgs</span>
            </div>
            <button
              type="button"
              onClick={handleExpandTier}
              disabled={isExpanding}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 cursor-pointer active:scale-95 transition-all shadow-xs shrink-0"
              title="Index next tier into vector memory"
            >
              {isExpanding ? (
                <>
                  <Loader2 size={10} className="animate-spin text-amber-400" />
                  <span>Indexing...</span>
                </>
              ) : (
                <>
                  <Plus size={10} />
                  <span>+ Index Tier</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-slate-400 font-mono text-[9px]">
          <Calendar size={11} />
          <span>{formatDate(doc.uploadedAt)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isReady) return;
              onSelectDoc(doc);
            }}
            disabled={!isReady}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out"
          >
            <MessageSquare size={11} />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDoc(docId);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer active:scale-[0.98]"
            title="Delete Document"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export function DocumentsView({ isUploading = false, uploadProgress = 0 }) {
  const {
    documents = [],
    handleFileUpload: uploadDocAction,
    handleDeleteDoc: deleteDocAction,
    expandVectorTier,
    generatedTreeDocIds = [],
    generateOrFetchTree,
    selectDocument,
  } = useDocumentStore();
  const setActiveSection = useUiStore((state) => state.setActiveSection);
  const fetchOverviewData = useOverviewStore(
    (state) => state.fetchOverviewData,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [viewerConfig, setViewerConfig] = useState({
    isOpen: false,
    documentId: "",
    name: "",
    pageCount: 0,
  });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const res = await uploadDocAction(e);
    if (res && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
    return res;
  };

  const handleDeleteDoc = async (id) => {
    const res = await deleteDocAction(id);
    if (res && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
    return res;
  };

  const handleOpenViewer = useCallback((doc) => {
    if (!doc) return;
    // MongoDB uses _id, while transformed objects might use id
    const docId = doc._id || doc.id;
    if (!docId) {
      console.error("[DocumentsView] Document missing valid ID:", doc);
      return;
    }

    setViewerConfig({
      isOpen: true,
      documentId: String(docId),
      name: doc.name || doc.fileName || "document.pdf",
      pageCount: Number(doc.pages || doc.totalPageCount || 0),
    });
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerConfig({
      isOpen: false,
      documentId: "",
      name: "",
      pageCount: 0,
    });
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [documents, searchQuery]);

  // Robust counter-based drag detection to prevent flicker
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const next = prev + 1;
      if (next === 1) setIsDraggingOver(true);
      return next;
    });
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setIsDraggingOver(false);
        return 0;
      }
      return next;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fakeEvent = { target: { files: e.dataTransfer.files } };
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full min-h-0 flex flex-col p-3 sm:p-4 select-none relative overflow-hidden"
    >
      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-3 border-b border-slate-200/60 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Document Library
              </h2>
              <span className="font-mono text-[9px] font-bold uppercase text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {filteredDocs.length} Total
              </span>
            </div>
            <p className="font-mono text-[10px] text-slate-400">
              Verified ground-truth bounding box repository
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={13}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents or tags..."
              className="w-full bg-white/70 border border-slate-200/80 rounded-xl py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* GRID: UPLOAD CARD SITS BESIDE THE FIRST DOCUMENT CARD     */}
      {/* ========================================================= */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar pr-0.5 pb-6"
        data-lenis-prevent
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
          {/* 1. DEDICATED INGESTION CARD (Exact matching dimensions) */}
          <motion.div
            variants={itemVariants}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            animate={{
              scale: isDraggingOver ? 1.02 : 1,
              borderColor: isDraggingOver
                ? "rgba(225, 29, 72, 0.9)"
                : "rgba(226, 232, 240, 0.8)",
              backgroundColor: isDraggingOver
                ? "rgba(255, 241, 242, 0.8)"
                : "rgba(255, 255, 255, 0.45)",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-colors group relative overflow-hidden min-h-[178px] ${
              filteredDocs.length === 0 ? "col-span-full md:col-span-2" : ""
            }`}
          >
            {/* Active upload progress rail */}
            {isUploading && (
              <div className="absolute top-0 inset-x-0 h-1 bg-slate-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 to-orange-500"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>
            )}

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  isDraggingOver
                    ? "bg-rose-500 text-white border-rose-600 scale-105"
                    : "bg-white border-slate-200 text-slate-600 group-hover:text-rose-600 group-hover:border-rose-200"
                }`}
              >
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin text-rose-600" />
                ) : isDraggingOver ? (
                  <FileUp size={18} />
                ) : (
                  <UploadCloud size={18} />
                )}
              </div>

              <span className="font-mono text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                PDF 1.4+
              </span>
            </div>

            {/* Middle Prompt */}
            <div className="my-2">
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                {isDraggingOver
                  ? "Drop PDF to Ingest"
                  : isUploading
                    ? `Indexing Nodes (${uploadProgress}%)`
                    : "Upload or Drop PDF"}
              </h3>
              <p className="font-mono text-[9px] text-slate-400 mt-1 line-clamp-2">
                {isDraggingOver
                  ? "Release file into runtime memory"
                  : "Drag file here or click to browse local storage"}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="font-mono text-[9px] text-slate-400">
                Max 50MB
              </span>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                <Plus size={12} />
                <span>Add Doc</span>
              </div>
            </div>
          </motion.div>

          {/* 2. DOCUMENT CARDS */}
          <AnimatePresence>
            {filteredDocs.map((doc) => {
              const docId = doc.id || doc._id;
              const hasTree = generatedTreeDocIds?.includes(docId);

              return (
                <DocumentCard
                  key={docId}
                  doc={doc}
                  hasTree={hasTree}
                  onOpenPdf={handleOpenViewer}
                  onGenerateTree={generateOrFetchTree}
                  onSelectDoc={(d) => {
                    selectDocument(d);
                    setActiveSection("chat");
                  }}
                  onDeleteDoc={handleDeleteDoc}
                  onExpandTier={expandVectorTier}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* PDF / IMAGE PREVIEW MODAL */}
      <PdfViewer
        isOpen={viewerConfig.isOpen}
        onClose={() => setViewerConfig((prev) => ({ ...prev, isOpen: false }))}
        documentId={viewerConfig.documentId}
        fileName={viewerConfig.name}
        pageCount={viewerConfig.pageCount}
      />

      {/* KNOWLEDGE TREE MODAL */}
      <KnowledgeTreeModal />
    </motion.div>
  );
}

export default DocumentsView;
