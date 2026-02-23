"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";
import { useGlobal } from "@/context/globalContext";

export default function DocumentsView() {
  const {
    documents,
    handleFileUpload,
    handleDeleteDoc,
    setSelectedDocument,
    setActiveSection,
  } = useGlobal();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="h-full max-h-[calc(100vh-140px)] flex flex-col gap-6 p-1 pb-8 overflow-hidden select-none">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-rose-600" size={24} />
            KNOWLEDGE VAULT
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Manage {documents.length} Indexed Neural Assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar - Neumorphic Inset */}
          <div className="relative group hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="SEARCH ASSETS..."
              className="bg-slate-100/50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-48 transition-all"
            />
          </div>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all">
            <Plus size={16} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Add Document
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
        className="flex-1 overflow-y-auto no-scrollbar pr-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* UPLOAD CARD TRIGGER */}
          <motion.label
            variants={itemVariants}
            className="group relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-rose-500/50 hover:bg-rose-50/30 transition-all cursor-pointer min-h-55"
          >
            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-rose-100 transition-all duration-300">
              <Upload className="text-rose-600" size={28} />
            </div>
            <p className="mt-4 font-black text-xs text-slate-800 uppercase tracking-widest">
              Upload PDF
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
              Max capacity 50MB
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </motion.label>

          <AnimatePresence mode="popLayout">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-[2.5rem] shadow-[4px_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between"
              >
                {/* Top Row: Icon & Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <FileText className="text-rose-600" size={24} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Metadata */}
                <div className="mb-6">
                  <h3 className="font-black text-sm text-slate-900 truncate uppercase tracking-tight group-hover:text-rose-600 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-slate-100 text-[8px] font-black text-slate-500 px-2 py-0.5 rounded-full uppercase">
                      {doc.pages} Pages
                    </span>
                    <span className="bg-slate-100 text-[8px] font-black text-slate-500 px-2 py-0.5 rounded-full uppercase">
                      {doc.size}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[9px] font-bold uppercase">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setActiveSection("chat");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      <MessageSquare size={10} />
                      Chat
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
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
