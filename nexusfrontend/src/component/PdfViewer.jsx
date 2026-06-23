"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

export default function PdfViewer({ onClose, pdfUrl, fileName }) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-5xl h-[85vh] bg-white border border-slate-200 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
            <h3 className="font-black text-xs lg:text-sm text-slate-800 uppercase tracking-wide truncate max-w-md">
              {fileName || "Secure Canvas"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs transition-transform active:scale-97 flex items-center justify-center"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all active:scale-97 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-slate-50">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full rounded-2xl border border-slate-200/60 shadow-inner bg-white"
          >
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-black text-slate-800 mb-4">
                Your browser does not support inline PDFs.
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-200 active:scale-97"
              >
                Download PDF
              </a>
            </div>
          </object>
        </div>
      </motion.div>
    </div>
  );
}
