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
  Shield,
} from "lucide-react";
import { useGlobal } from "@/store/globalStore";

const getStatusBadge = (status) => {
  if (status === "redacting") {
    return {
      label: "Shielding",
      className: "bg-amber-50 text-amber-600 animate-pulse",
      icon: Shield,
    };
  }

  return {
    label: "Secure",
    className: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  };
};

export default function DocumentsView() {
  const {
    documents,
    handleFileUpload,
    handleDeleteDoc,
    setSelectedDocument,
    setActiveSection,
  } = useGlobal();

  const [searchQuery, setSearchQuery] = useState("");

  // Search Logic
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [documents, searchQuery]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  return (
    <div className="h-full max-h-[calc(95vh-140px)] flex flex-col gap-4 lg:gap-6 p-2 lg:p-4 overflow-hidden select-none">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl shrink-0">
              <Layers className="text-rose-600 w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            KNOWLEDGE VAULT
          </h2>
          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
            {filteredDocs.length} Neural Assets Found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Responsive Search Bar */}
          <div className="relative group flex-1 min-w-50 sm:min-w-70">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors"
              size={14}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ASSETS..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-[10px] lg:text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-2xl shadow-lg shadow-rose-200 hover:scale-[1.03] active:scale-95 cursor-pointer transition-all shrink-0">
            <Plus size={16} />
            <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">
              Upload
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

      {/* --- DOCUMENTS GRID --- */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex-1 overflow-y-auto no-scrollbar px-2"
        style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }} // Added maxHeight and overflow auto
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
          {/* UPLOAD CARD */}
          <motion.label
            variants={itemVariants}
            className="group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 hover:border-rose-400 hover:bg-white transition-all cursor-pointer min-h-50 lg:min-h-60 shadow-sm"
          >
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <Upload size={24} />
            </div>
            <p className="mt-4 font-black text-[11px] lg:text-[12px] text-slate-800 uppercase tracking-widest group-hover:text-rose-600 transition-colors text-center">
              Ingest PDF
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </motion.label>

          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`group relative bg-white border border-slate-200 p-4 lg:p-6 rounded-4xl lg:rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden ${doc.status === "redacting" ? "opacity-75" : ""}`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex justify-between items-start mb-4 lg:mb-5">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors shrink-0">
                      <FileText className="text-rose-600 w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 ${getStatusBadge(doc.status).className}`}>
                        {React.createElement(getStatusBadge(doc.status).icon, { size: 8 })}
                        <span className="text-[7px] lg:text-[8px] font-black uppercase">
                          {getStatusBadge(doc.status).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-black text-xs lg:text-sm text-slate-900 truncate uppercase tracking-tight group-hover:text-rose-600 transition-colors mb-2">
                    {doc.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    <div className="flex items-center gap-1 text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase">
                      <Layers size={10} /> {doc.pages} Pages
                    </div>
                    <div className="flex items-center gap-1 text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase">
                      <Clock size={10} /> {doc.size}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 lg:mt-8 pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                  <div className="items-center gap-1 text-slate-400 hidden sm:flex">
                    <Calendar size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter truncate">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-1.5 lg:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        if (doc.status === "redacting") return;
                        setSelectedDocument(doc);
                        setActiveSection("chat");
                      }}
                      disabled={doc.status === "redacting"}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${doc.status === "redacting" ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700"}`}
                    >
                      <MessageSquare size={12} />
                      Chat
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 lg:p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Trash2 size={16} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
