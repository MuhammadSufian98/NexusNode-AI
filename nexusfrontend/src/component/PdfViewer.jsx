"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  ArrowDownToLine,
} from "lucide-react";
import API_BASE_URL, { API_BASE_URL as NamedApiBaseUrl } from "@/lib/apiBaseUrl";

const MAX_PREVIEW_PAGES = 80;

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: (dir) => ({ x: dir < 0 ? 80 : -80, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }),
};

export default function PdfViewer({
  isOpen,
  onClose,
  documentId,
  fileName,
  pageCount = 0,
  initialPage = 1,
}) {
  const [mounted, setMounted] = useState(false);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [totalPages, setTotalPages] = useState(pageCount || 1);
  const [direction, setDirection] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Large document threshold check
  const isTooLarge = totalPages > MAX_PREVIEW_PAGES;

  const baseUrl = (API_BASE_URL || NamedApiBaseUrl || "http://localhost:5000").replace(/\/$/, "");

  // Generate target image URL directly
  const currentImageUrl = useMemo(() => {
    if (!documentId) return "";
    return `${baseUrl}/api/rag/documents/${documentId}/page-preview?page=${pageNumber}`;
  }, [baseUrl, documentId, pageNumber]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (pageCount && pageCount > 0) {
      setTotalPages(pageCount);
    }
  }, [pageCount]);

  useEffect(() => {
    if (initialPage) {
      setPageNumber(initialPage);
      setPageInput(String(initialPage));
    }
  }, [initialPage]);

  // Reset loading whenever pageNumber or documentId changes
  useEffect(() => {
    if (isOpen && documentId && !isTooLarge) {
      setImageLoading(true);
      setErrorMsg(null);
    }
  }, [isOpen, documentId, pageNumber, isTooLarge]);

  const paginate = (newDirection) => {
    const target = pageNumber + newDirection;
    if (target >= 1 && target <= totalPages) {
      setDirection(newDirection);
      setPageNumber(target);
      setPageInput(String(target));
    }
  };

  const handlePageInputSubmit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setDirection(parsed > pageNumber ? 1 : -1);
      setPageNumber(parsed);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    if (swipePower < -10000 || offset.x < -80) {
      paginate(1);
    } else if (swipePower > 10000 || offset.x > 80) {
      paginate(-1);
    }
  };

  const handleDownload = () => {
    if (!documentId) return;
    const downloadEndpoint = `${baseUrl}/api/rag/documents/${documentId}/preview-stream`;
    const a = document.createElement("a");
    a.href = downloadEndpoint;
    a.download = fileName || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md select-none"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl h-[88vh] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="h-14 px-4 bg-[#F8F9FA] border-b border-slate-200 flex items-center justify-between shrink-0 gap-3">
          <div className="min-w-0 flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
              PREVIEW
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={fileName}>
              {fileName || "Document Preview"}
            </h3>
          </div>

          {/* Navigation Controls */}
          {!isTooLarge && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-xl">
              <button
                type="button"
                onClick={() => paginate(-1)}
                disabled={pageNumber <= 1}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageInputSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
                  className="w-9 text-center font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded py-0.5 outline-none focus:border-rose-400"
                />
                <span className="font-mono text-[11px] font-semibold text-slate-400">
                  / {totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={() => paginate(1)}
                disabled={pageNumber >= totalPages}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>

              <div className="w-px h-3.5 bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>

              <span className="font-mono text-[10px] text-slate-400 min-w-8 text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>

              <div className="w-px h-3.5 bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Rotate"
              >
                <RotateCw size={13} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              title="Download File"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Stage */}
        <div className="flex-1 w-full h-full overflow-hidden bg-[#F1F3F5] flex items-center justify-center relative p-4">
          {imageLoading && !errorMsg && !isTooLarge && (
            <div className="absolute z-10 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl shadow-xs border border-slate-100">
              <Loader2 size={20} className="animate-spin text-rose-600" />
              <span className="text-xs font-mono text-slate-600">Rendering page {pageNumber}...</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs">
              <AlertCircle size={24} className="text-rose-500" />
              <p className="text-xs font-bold text-slate-800">{errorMsg}</p>
              <p className="text-[10px] font-mono text-slate-400">Endpoint: {currentImageUrl}</p>
            </div>
          )}

          {/* Large PDF Guard */}
          {isTooLarge && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Document Too Large for In-App Preview
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This document contains {totalPages} pages. In-app preview is disabled to preserve system responsiveness.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm active:scale-98"
              >
                <ArrowDownToLine size={14} />
                <span>Download PDF to Read</span>
              </button>
            </div>
          )}

          {/* Native Image Renderer */}
          {!isTooLarge && currentImageUrl && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={`${documentId}-${pageNumber}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: "transform 0.15s ease",
                  }}
                  className="cursor-grab active:cursor-grabbing max-h-full max-w-full flex items-center justify-center shadow-lg rounded-lg overflow-hidden bg-white"
                >
                  <img
                    src={currentImageUrl}
                    alt={`Page ${pageNumber}`}
                    className="max-h-[80vh] w-auto object-contain select-none pointer-events-none"
                    onLoad={() => {
                      setImageLoading(false);
                    }}
                    onError={() => {
                      setImageLoading(false);
                      setErrorMsg(`Unable to load page ${pageNumber}. Check backend logs.`);
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}

export const MediaViewerModal = PdfViewer;
