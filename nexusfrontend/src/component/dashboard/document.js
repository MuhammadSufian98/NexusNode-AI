"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Upload,
  MessageSquare,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useGlobal } from "@/store/globalStore";
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
  } = useGlobal();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

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
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 140, damping: 15 },
    },
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="h-full min-h-0 flex flex-col gap-4 lg:gap-6 p-2 lg:p-4 overflow-hidden select-none relative"
    >
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 px-1 sm:px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl shrink-0">
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
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-[10px] lg:text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>

          <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-2xl shadow-lg shadow-rose-200/50 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all shrink-0 w-full sm:w-auto">
            <Plus size={16} />
            <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">
              Upload File
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* --- DOCUMENTS TILES CONTAINER --- */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2 pb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
          {/* DRAG AND DROP INGESTION CARD */}
          <motion.label
            variants={itemVariants}
            className={`group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] border-2 bg-white/50 hover:bg-white transition-all duration-300 min-h-52 lg:min-h-60 shadow-xs overflow-hidden ${
              isDraggingOver
                ? "border-transparent scale-[0.99]"
                : "border-dashed border-slate-200 hover:border-rose-400"
            }`}
          >
            {isDraggingOver && (
              <div className="absolute inset-0 mask-animated-border">
                <div className="absolute inset-[-50%] bg-linear-to-r from-rose-500 via-orange-400 to-rose-500 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[3px] bg-white rounded-[2.3rem] lg:rounded-[2.8rem]" />
              </div>
            )}

            <div
              className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner relative z-10 ${
                isDraggingOver
                  ? "bg-rose-600 text-white scale-110"
                  : "bg-rose-50 text-rose-600 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white"
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
                <span className="text-slate-800 group-hover:text-rose-600">
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

          {/* ACTIVE PARAMETERS GENERATION CARD */}
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
                    scale: 0.93,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => {
                    if (doc.status === "redacting") return;
                    openPdfViewer(doc.pdfUrl, doc.name);
                  }}
                  className={`group relative bg-white border border-slate-200 p-4 lg:p-5 rounded-4xl lg:rounded-[3rem] shadow-xs hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                    doc.status === "redacting" ? "opacity-70" : ""
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    <div className="flex justify-between items-start mb-4 lg:mb-5">
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xs group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors shrink-0">
                          <FileText className="text-rose-600 w-5 h-5 lg:w-5 lg:h-5" />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (doc.status === "redacting") return;
                            generateOrFetchTree(doc.id);
                          }}
                          disabled={doc.status === "redacting"}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer relative bg-white border ${
                            hasTree
                              ? "border-rose-400 shadow-md shadow-rose-100"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src="/document/tree.svg"
                            alt="Tree Map"
                            className={`w-4 h-4 object-contain transition-all ${
                              hasTree
                                ? "gradient-tree-mask"
                                : "opacity-40 grayscale group-hover:opacity-75"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 bg-emerald-50 text-emerald-600`}
                        >
                          <CheckCircle2 size={8} />
                          <span className="text-[7px] lg:text-[8px] font-black uppercase">
                            Secure
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-black text-xs lg:text-[13px] text-slate-900 truncate uppercase tracking-tight group-hover:text-rose-600 transition-colors mb-2 pl-0.5">
                      {doc.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 pl-0.5">
                      <div className="flex items-center gap-1 text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase">
                        <Layers size={10} /> {doc.pages} Pages
                      </div>
                      <div className="flex items-center gap-1 text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase">
                        <Clock size={10} /> {doc.size}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTIONS STRIP */}
                  <div className="mt-5 lg:mt-6 pt-3.5 border-t border-slate-50 flex items-center justify-between gap-2">
                    <div className="items-center gap-1 text-slate-400 hidden sm:flex">
                      <Calendar size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter truncate">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-1.5 lg:gap-2 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.status === "redacting") return;
                          setSelectedDocument(doc);
                          setActiveSection("chat");
                        }}
                        disabled={doc.status === "redacting"}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-xs bg-slate-50 border border-slate-100 hover:bg-slate-900 hover:border-slate-900 hover:text-white text-slate-700"
                      >
                        <MessageSquare size={11} />
                        Chat
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {documents.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-4xl lg:rounded-[3rem] p-8 md:p-12 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <p className="text-base font-black text-slate-900">
                Library Catalogue Empty
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Upload or drag a valid document into the panel grid interface.
              </p>
            </div>
          )}

          {documents.length > 0 && filteredDocs.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-4xl lg:rounded-[3rem] p-8 text-center shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Search size={18} />
              </div>
              <p className="text-sm font-black text-slate-900">
                No Matching Records
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Revise criteria search string parameters.
              </p>
            </div>
          )}
        </div>
      </motion.div>

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
    </div>
  );
}
