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
import { useGlobal } from "@/store/globalStore";
import { toast } from "react-hot-toast";
import PdfViewer from "@/component/PdfViewer";
import KnowledgeTreeModal from "@/components/KnowledgeTreeModal";

export default function DocumentsView() {
  const {
    documents,
    handleFileUpload,
    handleDeleteDoc,
    setSelectedDocument,
    setActiveSection,
    generatedTreeDocIds,
    generateOrFetchTree,
    selectDocument,
  } = useGlobal();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [errorModalDoc, setErrorModalDoc] = useState(null);

  const openPdfViewer = (url, name) => {
    setSelectedPdfUrl(url);
    setSelectedPdfName(name);
    setViewerOpen(true);
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 24 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
        </div>
      </div>

      {/* DOCUMENTS GRID CONTAINER */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 pb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
          {/* ORIGINAL INGEST CARD UI PRESERVED */}
          <motion.label
            variants={itemVariants}
            className={`group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] border-2 bg-white/50 hover:bg-white transition-all duration-600 min-h-52 lg:min-h-60 overflow-hidden cursor-pointer ${
              isDraggingOver
                ? "border-transparent scale-[0.99]"
                : "border-dashed border-slate-200 hover:border-rose-400"
            }`}
          >
            {isDraggingOver && (
              <div className="absolute inset-0 mask-animated-border">
                <div className="absolute inset-[-50%] bg-gradient-to-r from-rose-500 via-orange-400 to-rose-500 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[3px] bg-white rounded-[2.3rem] lg:rounded-[2.8rem]" />
              </div>
            )}

            <div
              className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 border ${
                isDraggingOver
                  ? "bg-gradient-to-tr from-rose-600 via-rose-500 to-orange-500 text-white border-transparent scale-110"
                  : "bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 text-rose-600 border-rose-200/80 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-rose-600 group-hover:via-rose-500 group-hover:to-orange-500 group-hover:text-white group-hover:border-transparent"
              }`}
            >
              <Upload size={22} />
            </div>

            <p className="mt-4 font-black text-[11px] lg:text-[12px] uppercase tracking-widest transition-colors text-center px-4 leading-snug relative z-10">
              {isDraggingOver ? (
                <span className="text-rose-600 animate-pulse">
                  Release to Upload
                </span>
              ) : (
                <span className="text-slate-800 group-hover:text-rose-600 transform transition-all duration-300">
                  Ingest Document
                </span>
              )}
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </motion.label>

          {/* REFINED PDF CARD */}
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => {
              const hasTree = generatedTreeDocIds?.includes(doc.id);

              return (
                <motion.div
                  key={doc.id}
                  layout
                  variants={itemVariants}
                  exit={{
                    opacity: 0,
                    scale: 0.94,
                    transition: { duration: 0.18 },
                  }}
                  onClick={() => {
                    if (doc.status === "processing") {
                      toast.error("Document is currently being processed.");
                      return;
                    }
                    if (doc.status === "failed") {
                      setErrorModalDoc(doc);
                      return;
                    }
                    if (doc.status === "redacting") return;
                    openPdfViewer(doc.pdfUrl, doc.name);
                  }}
                  className={`group relative bg-white/90 backdrop-blur-md border border-slate-200/90 p-4 lg:p-5 rounded-3xl lg:rounded-4xl hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                    doc.status === "redacting" ? "opacity-65" : ""
                  } ${
                    doc.status === "failed"
                      ? "border-rose-200 bg-rose-50/20"
                      : ""
                  }`}
                >
                  <div>
                    {/* CARD HEADER & BADGES */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        {/* 3-color icon box */}
                        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center shrink-0 group-hover:border-rose-300 transition-colors">
                          <FileText className="text-rose-600 w-5 h-5" />
                        </div>

                        {/* Knowledge Tree Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (doc.status !== "ready") return;
                            generateOrFetchTree(doc.id);
                          }}
                          disabled={doc.status !== "ready"}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border disabled:opacity-40 ${
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
                      <span>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
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
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all bg-slate-900 text-white hover:bg-gradient-to-r hover:from-rose-600 hover:via-rose-500 hover:to-orange-500 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      >
                        <MessageSquare size={11} />
                        Chat
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

          {/* SEARCH NO MATCH */}
          {documents.length > 0 && filteredDocs.length === 0 && (
            <div className="col-span-full bg-white/70 border border-slate-200 rounded-3xl p-8 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                <Search size={16} />
              </div>
              <p className="text-xs font-black text-slate-900">
                No Matching Records
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                Revise criteria search string parameters.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* PDF VIEWER MODAL */}
      <AnimatePresence>
        {viewerOpen && (
          <PdfViewer
            onClose={() => setViewerOpen(false)}
            pdfUrl={selectedPdfUrl}
            fileName={selectedPdfName}
          />
        )}
      </AnimatePresence>

      <KnowledgeTreeModal />

      {/* ERROR MODAL */}
      <AnimatePresence>
        {errorModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                Embedding Generation Failed
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate max-w-xs">
                {errorModalDoc.name}
              </p>

              <div className="my-3.5 p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 text-[11px] font-mono text-rose-700 w-full text-left break-words">
                {errorModalDoc.errorMessage ||
                  "Failed to create embeddings for this PDF."}
              </div>

              <div className="flex gap-2 w-full mt-1">
                <button
                  onClick={() => setErrorModalDoc(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    const docId = errorModalDoc.id;
                    setErrorModalDoc(null);
                    await handleDeleteDoc(docId);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer hover:opacity-95 transition-opacity"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .mask-animated-border {
          position: absolute;
          inset: 0;
          border-radius: 2.5rem;
          padding: 3px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .mask-animated-border {
            border-radius: 3rem;
          }
        }
        .gradient-tree-mask {
          filter: invert(18%) sepia(87%) saturate(5481%) hue-rotate(344deg)
            brightness(91%) contrast(92%);
        }
      `}</style>
    </motion.div>
  );
}
