"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
  MessageSquare,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { useDocumentStore, useUiStore, useOverviewStore } from "@/store";
import { formatDate, truncateText } from "@/utils/formatters";
import PdfViewer from "@/component/PdfViewer";
import KnowledgeTreeModal from "@/components/KnowledgeTreeModal";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

export function DocumentsView({ isUploading = false, uploadProgress = 0 }) {
  const {
    documents,
    handleFileUpload: uploadDocAction,
    handleDeleteDoc: deleteDocAction,
    setSelectedDocument,
    generatedTreeDocIds,
    generateOrFetchTree,
    selectDocument,
  } = useDocumentStore();
  const setActiveSection = useUiStore((state) => state.setActiveSection);
  const fetchOverviewData = useOverviewStore((state) => state.fetchOverviewData);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [errorModalDoc, setErrorModalDoc] = useState(null);

  const handleFileUpload = async (e) => {
    const res = await uploadDocAction(e);
    if (res) {
      fetchOverviewData();
    }
    return res;
  };

  const handleDeleteDoc = async (id) => {
    const res = await deleteDocAction(id);
    if (res) {
      fetchOverviewData();
    }
    return res;
  };

  const openPdfViewer = (url, name) => {
    setSelectedPdfUrl(url);
    setSelectedPdfName(name);
    setViewerOpen(true);
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
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
  };

  const handleDrop = (e) => {
    e.preventDefault();
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
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="h-full min-h-0 flex flex-col gap-4 lg:gap-6 p-2 lg:p-4 overflow-hidden select-none relative"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 px-1 sm:px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-2xl shrink-0">
              <Layers className="text-rose-600 w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            DOCUMENT LIBRARY
          </h2>
          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
            {filteredDocs.length} Active Records Cataloged
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 min-w-0 sm:min-w-70 w-full sm:w-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors"
              size={14}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH DOCUMENTS..."
              className="w-full bg-white/90 border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-[10px] lg:text-[11px] font-bold text-slate-700 focus:outline-none focus:border-rose-400 focus:bg-white transition-all placeholder:text-slate-300"
            />
          </div>

          <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white rounded-2xl font-black text-[10px] lg:text-[11px] uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-97 transition-all cursor-pointer">
            <Plus size={16} />
            <span>Upload Document</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* DOCUMENTS GRID CONTAINER */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 sm:px-2 pb-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => {
              const hasTree = generatedTreeDocIds?.includes(doc.id);

              return (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  layout
                  onClick={() => {
                    if (doc.status === "failed") {
                      setErrorModalDoc(doc);
                    } else if (doc.status === "ready" && doc.pdfUrl) {
                      openPdfViewer(doc.pdfUrl, doc.name);
                    }
                  }}
                  className={`bg-white/80 hover:bg-white border rounded-3xl p-4 lg:p-5 flex flex-col justify-between transition-all duration-200 group relative ${
                    doc.status === "failed"
                      ? "border-rose-200 bg-rose-50/20 hover:border-rose-300 cursor-pointer"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div>
                    {/* TOP BADGE / TREE BUTTON ROW */}
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 ${
                            doc.status === "failed"
                              ? "bg-rose-100 text-rose-600 border-rose-200"
                              : "bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border-rose-200/80 text-rose-600"
                          }`}
                        >
                          <FileText size={18} />
                        </div>

                        {/* Tree Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (doc.status !== "ready") return;
                            generateOrFetchTree(doc.id);
                          }}
                          disabled={doc.status !== "ready"}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border disabled:opacity-40 active:scale-95 ${
                            hasTree
                              ? "bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border-rose-300 text-rose-600"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500"
                          }`}
                          title="View Knowledge Tree"
                        >
                          <img
                            src="/document/tree.svg"
                            alt="Tree Map"
                            className={`w-4 h-4 object-contain ${
                              hasTree
                                ? "gradient-tree-mask"
                                : "opacity-40 grayscale group-hover:opacity-75"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end">
                        {doc.status === "ready" && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700">
                            <CheckCircle2 size={9} />
                            <span className="text-[8px] font-black uppercase tracking-wider">
                              Ready
                            </span>
                          </div>
                        )}
                        {doc.status === "processing" && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-[8px] font-black uppercase tracking-wider">
                              Indexing
                            </span>
                          </div>
                        )}
                        {doc.status === "failed" && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700">
                            <AlertTriangle size={9} className="shrink-0" />
                            <span className="text-[8px] font-black uppercase tracking-wider">
                              Failed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FILE TITLE & METADATA */}
                    <h3
                      className="font-black text-xs lg:text-[13px] text-slate-900 truncate uppercase tracking-tight group-hover:text-rose-600 transition-colors mb-2 pl-0.5"
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 pl-0.5 text-[9px] font-bold text-slate-400 uppercase">
                      <div className="flex items-center gap-1">
                        <FileCheck size={11} className="text-slate-400" />
                        <span>{doc.pages} Pages</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION ROW */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="items-center gap-1 text-slate-400 hidden sm:flex text-[9px] font-bold uppercase tracking-tight truncate">
                      <Calendar size={11} />
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.status !== "ready") return;
                          selectDocument(doc);
                          setActiveSection("chat");
                        }}
                        disabled={doc.status !== "ready"}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all bg-slate-900 text-white hover:bg-gradient-to-r hover:from-rose-600 hover:via-rose-500 hover:to-orange-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-97"
                      >
                        <MessageSquare size={11} />
                        Chat
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer active:scale-95"
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* EMPTY REPOSITORY */}
          {documents.length === 0 && (
            <div className="col-span-full bg-white/70 border border-slate-200 rounded-3xl p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mb-3">
                <FileText size={22} />
              </div>
              <p className="text-sm font-black text-slate-900">
                Library Catalogue Empty
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Upload or drop a document to begin vector ingestion.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF VIEWER MODAL */}
      <PdfViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        pdfUrl={selectedPdfUrl}
        fileName={selectedPdfName}
      />

      {/* KNOWLEDGE TREE MODAL */}
      <KnowledgeTreeModal />
    </motion.div>
  );
}

export default DocumentsView;
