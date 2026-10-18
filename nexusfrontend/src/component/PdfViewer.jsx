"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import API_BASE_URL, { API_BASE_URL as NamedApiBaseUrl } from "@/lib/apiBaseUrl";

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
  },
  exit: (dir) => ({
    x: dir < 0 ? 60 : -60,
    opacity: 0,
    transition: { duration: 0.12, ease: "easeIn" },
  }),
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
  const [hasError, setHasError] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const abortControllerRef = useRef(null);
  const blobUrlRef = useRef(null);

  const baseUrl = (API_BASE_URL || NamedApiBaseUrl || "http://localhost:5000").replace(/\/$/, "");

  // Update totalPages when prop updates
  useEffect(() => {
    if (pageCount && pageCount > 0) {
      setTotalPages(pageCount);
    }
  }, [pageCount]);

  // Sync initialPage when prop changes
  useEffect(() => {
    if (initialPage) {
      setPageNumber(initialPage);
      setPageInput(String(initialPage));
    }
  }, [initialPage]);

  // Mount detection for React portal
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // Fetch page preview with active AbortController cancellation
  useEffect(() => {
    if (!isOpen || !documentId) return;

    // Abort previous in-flight task on rapid page changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let isSubscribed = true;
    setImageLoading(true);
    setHasError(false);

    const targetUrl = `${baseUrl}/api/rag/documents/${documentId}/page-preview?page=${pageNumber}`;

    fetch(targetUrl, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Render failed with status: ${response.status}`);
        }

        // Dynamically extract page count if server reported it
        const totalHeader = response.headers.get("x-total-pages");
        if (totalHeader) {
          const parsed = parseInt(totalHeader, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setTotalPages((prev) => Math.max(prev, parsed));
          }
        }

        return response.blob();
      })
      .then((blob) => {
        if (!isSubscribed) return;

        // Revoke previous blob URL to avoid memory leak
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        const newBlobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = newBlobUrl;
        setBlobUrl(newBlobUrl);
        setImageLoading(false);
        setHasError(false);
      })
      .catch((err) => {
        if (err.name === "AbortError" || !isSubscribed) {
          // Normal cancellation on rapid pagination
          return;
        }
        console.warn("[PdfViewer] Page render request failed:", err.message);
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        setBlobUrl(null);
        setImageLoading(false);
        setHasError(true);
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [isOpen, documentId, pageNumber, retryTrigger, baseUrl]);

  // Clean up blob on modal close
  useEffect(() => {
    if (!isOpen && blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setBlobUrl(null);
    }
  }, [isOpen]);

  const paginate = useCallback(
    (newDirection) => {
      const target = pageNumber + newDirection;
      if (target >= 1 && target <= totalPages) {
        setDirection(newDirection);
        setPageNumber(target);
        setPageInput(String(target));
      }
    },
    [pageNumber, totalPages]
  );

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

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, paginate, onClose]);

  if (!isOpen || !mounted) return null;

  const downloadEndpoint = `${baseUrl}/api/rag/documents/${documentId}/preview-stream`;

  const modalNode = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-md select-none"
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
            {totalPages > 80 && (
              <span className="hidden md:inline font-mono text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                Large Doc ({totalPages}p)
              </span>
            )}
          </div>

          {/* Navigation & Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => paginate(-1)}
              disabled={pageNumber <= 1}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer active:scale-[0.97] transition-transform"
              title="Previous Page (Left Arrow)"
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
                className="w-10 text-center font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded py-0.5 outline-none focus:border-rose-400"
              />
              <span className="font-mono text-[11px] font-semibold text-slate-400">
                / {totalPages}
              </span>
            </div>

            <button
              type="button"
              onClick={() => paginate(1)}
              disabled={pageNumber >= totalPages}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer active:scale-[0.97] transition-transform"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight size={14} />
            </button>

            <div className="w-px h-3.5 bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer active:scale-[0.97] transition-transform"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>

            <span className="font-mono text-[10px] text-slate-400 min-w-8 text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer active:scale-[0.97] transition-transform"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>

            <div className="w-px h-3.5 bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer active:scale-[0.97] transition-transform"
              title="Rotate 90°"
            >
              <RotateCw size={13} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer active:scale-[0.97] transition-all"
              title="Download Original PDF"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer active:scale-[0.97] transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Stage */}
        <div className="flex-1 w-full h-full overflow-hidden bg-[#F1F3F5] flex items-center justify-center relative p-4">
          {/* Loading Indicator */}
          {imageLoading && !hasError && (
            <div className="absolute z-20 flex flex-col items-center justify-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-3 rounded-2xl shadow-sm border border-slate-200">
              <Loader2 size={22} className="animate-spin text-rose-600" />
              <span className="text-xs font-mono text-slate-700">Rendering page {pageNumber}...</span>
            </div>
          )}

          {/* Graceful Error State */}
          {hasError && (
            <div className="z-10 flex flex-col items-center justify-center gap-3 p-6 text-center max-w-md bg-white border border-rose-200 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Unable to render preview for this page.
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The server could not rasterize page {pageNumber}. You can retry or access the complete PDF directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer active:scale-[0.97] transition-all shadow-xs"
                >
                  <RefreshCw size={12} />
                  <span>Retry Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer active:scale-[0.97] transition-all"
                >
                  <Download size={12} />
                  <span>Download PDF</span>
                </button>

                <a
                  href={downloadEndpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl cursor-pointer active:scale-[0.97] transition-all"
                >
                  <ExternalLink size={12} />
                  <span>Open Full PDF</span>
                </a>
              </div>
            </div>
          )}

          {/* Rasterized Page Image View (only rendered when blobUrl exists and no error) */}
          {!hasError && blobUrl && (
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
                    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  className="cursor-grab active:cursor-grabbing max-h-full max-w-full flex items-center justify-center shadow-md rounded-lg overflow-hidden bg-white border border-slate-200"
                >
                  <img
                    src={blobUrl}
                    alt={`Page ${pageNumber}`}
                    className="max-h-[78vh] w-auto object-contain select-none pointer-events-none"
                    draggable={false}
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
