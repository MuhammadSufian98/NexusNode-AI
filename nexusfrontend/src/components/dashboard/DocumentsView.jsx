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
  Eye,
  UploadCloud,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useDocumentStore, useUiStore } from "@/store";
import { formatDate } from "@/utils/formatters";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB

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
  onOpenPdf,
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
        {/* Top Row: Icon + Status */}
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
          title={doc.name || doc.title}
        >
          {doc.name || doc.title || "Document.pdf"}
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
              onOpenPdf(doc);
            }}
            disabled={!isReady}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-30"
            title="Preview PDF"
          >
            <Eye size={13} />
          </button>

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

const EMPTY_ARRAY = [];

export function DocumentsView() {
  const rawDocuments = useDocumentStore((state) => state.documents);
  const documents = rawDocuments || EMPTY_ARRAY;
  const uploadDocAction = useDocumentStore((state) => state.handleFileUpload);
  const deleteDocAction = useDocumentStore((state) => state.handleDeleteDoc);
  const expandVectorTier = useDocumentStore((state) => state.expandVectorTier);
  const selectDocument = useDocumentStore((state) => state.selectDocument);
  const isUploading = useDocumentStore((state) => state.isUploading);
  const uploadProgress = useDocumentStore((state) => state.uploadProgress);

  const setActiveSection = useUiStore((state) => state.setActiveSection);

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

  const validateAndProcessFile = useCallback(
    (file) => {
      if (!file) return;

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        toast.error("Invalid file format. Please upload a PDF document.");
        return;
      }

      if (file.size > MAX_PDF_BYTES) {
        toast.error("File exceeds maximum allowed size (50MB).");
        return;
      }

      uploadDocAction(file);
    },
    [uploadDocAction]
  );

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    e.target.value = "";
  };

  const handleOpenViewer = useCallback((doc) => {
    if (!doc) return;
    const docId = doc._id || doc.id;
    if (!docId) return;

    setViewerConfig({
      isOpen: true,
      documentId: String(docId),
      name: doc.name || doc.fileName || doc.title || "document.pdf",
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
      (doc.name || doc.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // Drag-and-drop detection with counter
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
      validateAndProcessFile(e.dataTransfer.files[0]);
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
        onChange={handleFileInputChange}
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
              Grounded PDF vault for low-latency neural retrieval
            </p>
          </div>
        </div>

        {/* Search Bar & Upload Button */}
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
              placeholder="Filter by document name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200/90 rounded-xl outline-none focus:border-rose-400 font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.98] transition-transform duration-100 ease-out cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Upload PDF</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* STAGE CONTAINER WITH DRAG AND DROP */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar relative rounded-2xl"
      >
        {/* DRAG-AND-DROP OVERLAY BACKDROP */}
        <AnimatePresence>
          {isDraggingOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-rose-50/90 border-2 border-dashed border-rose-400 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-2xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-rose-600">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-slate-900">
                Drop your PDF document here
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Maximum file size: 50MB (PDF only)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DOCUMENT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* UPLOAD CARD TRIGGER */}
          <motion.div
            variants={itemVariants}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-300 hover:border-rose-400 bg-white/40 hover:bg-rose-50/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors min-h-[178px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-rose-100 text-slate-400 group-hover:text-rose-600 flex items-center justify-center transition-colors">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                Index New PDF
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Drag and drop or click to browse
              </p>
            </div>
          </motion.div>

          {/* DOCUMENT CARDS */}
          <AnimatePresence>
            {filteredDocs.map((doc) => {
              const docId = doc.id || doc._id;

              return (
                <DocumentCard
                  key={docId}
                  doc={doc}
                  onOpenPdf={handleOpenViewer}
                  onSelectDoc={(d) => {
                    selectDocument(d);
                    setActiveSection("chat");
                  }}
                  onDeleteDoc={deleteDocAction}
                  onExpandTier={expandVectorTier}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* PDF VIEWER MODAL */}
      <PdfViewer
        isOpen={viewerConfig.isOpen}
        onClose={handleCloseViewer}
        documentId={viewerConfig.documentId}
        fileName={viewerConfig.name}
        pageCount={viewerConfig.pageCount}
      />
    </motion.div>
  );
}

export default DocumentsView;
