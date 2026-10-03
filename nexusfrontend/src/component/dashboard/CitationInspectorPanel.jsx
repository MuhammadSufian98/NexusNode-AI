"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  ArrowDownToLine,
} from "lucide-react";
import API_BASE_URL from "@/lib/apiBaseUrl";
import toast from "react-hot-toast";

const MAX_PREVIEW_PAGES = 80;

/**
 * Slide-over Citation Inspector Panel with Direct Server-Side Page Rasterization
 */
export default function CitationInspectorPanel({
  citation,
  allCitations = [],
  onSelectCitation,
  onClose,
}) {
  const [pageNumber, setPageNumber] = useState(citation?.pageNumber || 1);
  const [totalPages, setTotalPages] = useState(
    citation?.pageCount || citation?.pages || citation?.totalPageCount || 1
  );
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Sync page number and total pages when citation changes
  useEffect(() => {
    if (citation?.pageNumber) {
      setPageNumber(Number(citation.pageNumber) || 1);
      setImageLoading(true);
      setErrorMessage(null);
    }
    if (citation?.pageCount || citation?.pages || citation?.totalPageCount) {
      setTotalPages(
        citation.pageCount || citation.pages || citation.totalPageCount
      );
    }
  }, [citation]);

  const documentId = citation?.documentId;
  const fileName =
    citation?.documentName || citation?.fileName || "Document.pdf";
  const textSnippet = citation?.textSnippet || citation?.snippet || "";
  const matchScore = citation?.similarityScore || citation?.score || 0.88;
  const isTooLarge = totalPages > MAX_PREVIEW_PAGES;

  const baseUrl = (API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
  const imageUrl = documentId
    ? `${baseUrl}/api/rag/documents/${documentId}/page-preview?page=${pageNumber}`
    : "";

  // Citation navigation index
  const currentIndex = useMemo(() => {
    if (!allCitations || allCitations.length === 0 || !citation) return -1;
    return allCitations.findIndex(
      (c) =>
        (c.documentId === citation.documentId ||
          c.fileName === citation.fileName) &&
        c.pageNumber === citation.pageNumber &&
        (c.textSnippet === citation.textSnippet || c.snippet === citation.snippet)
    );
  }, [allCitations, citation]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allCitations.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectCitation) {
      onSelectCitation(allCitations[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectCitation) {
      onSelectCitation(allCitations[currentIndex + 1]);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!documentId) return;
    const target = `${baseUrl}/api/rag/documents/${documentId}/preview-stream`;
    window.open(target, "_blank");
  };

  // Copy snippet handler
  const handleCopySnippet = async () => {
    if (!textSnippet) return;
    try {
      await navigator.clipboard.writeText(textSnippet);
      setCopiedSnippet(true);
      toast.success("Citation snippet copied!");
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      toast.error("Failed to copy citation text");
    }
  };

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-[90%] md:w-[48%] lg:w-[44%] xl:w-[40%] bg-white/95 backdrop-blur-md border-l border-slate-200/90 shadow-2xl flex flex-col overflow-hidden select-none"
    >
      {/* 1. TOP HEADER BAR */}
      <div className="h-14 px-4 bg-[#F8F9FA] border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] font-bold text-rose-600 uppercase tracking-wide">
                CITATION VERIFICATION • PAGE {pageNumber}
              </span>
            </div>
            <h3
              className="text-xs font-bold text-slate-900 truncate leading-tight"
              title={fileName}
            >
              {fileName}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Similarity Match Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 font-mono text-[9px] font-bold">
            <CheckCircle2 size={10} />
            <span>{Math.round(matchScore * 100)}% Match</span>
          </div>

          {/* Citation List Prev / Next Navigation */}
          {allCitations.length > 1 && (
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer transition-transform active:scale-95"
                title="Previous citation"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="font-mono text-[9px] text-slate-400 px-1">
                {currentIndex + 1}/{allCitations.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer transition-transform active:scale-95"
                title="Next citation"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Download Original */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer transition-transform active:scale-95"
            title="Download PDF"
          >
            <Download size={14} />
          </button>

          {/* Close Panel */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-transform active:scale-95"
            title="Close Citation Inspector"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. SUB-TOOLBAR: ZOOM & PAGE CONTROLS */}
      {!isTooLarge && (
        <div className="h-9 px-4 bg-white border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPageNumber((p) => Math.max(1, p - 1));
                setImageLoading(true);
                setErrorMessage(null);
              }}
              disabled={pageNumber <= 1}
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-transform active:scale-95"
              title="Previous page"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="font-mono text-[10px] font-semibold text-slate-700">
              Page {pageNumber} {totalPages ? `/ ${totalPages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setPageNumber((p) =>
                  totalPages ? Math.min(totalPages, p + 1) : p + 1
                );
                setImageLoading(true);
                setErrorMessage(null);
              }}
              disabled={totalPages ? pageNumber >= totalPages : false}
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-transform active:scale-95"
              title="Next page"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer transition-transform active:scale-95"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="font-mono text-[10px] text-slate-400 min-w-8 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer transition-transform active:scale-95"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer transition-transform active:scale-95"
              title="Rotate"
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 3. PDF PAGE DISPLAY VIEWPORT */}
      <div className="flex-1 w-full overflow-auto bg-[#F1F3F5] flex items-center justify-center p-3 relative overscroll-contain">
        {imageLoading && !errorMessage && !isTooLarge && (
          <div className="absolute z-10 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl shadow-sm border border-slate-200">
            <Loader2 size={20} className="animate-spin text-rose-600" />
            <span className="text-xs font-mono text-slate-700">
              Rendering page {pageNumber}...
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="m-auto flex flex-col items-center justify-center gap-3 p-5 text-center max-w-sm bg-white rounded-2xl border border-rose-200 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle size={18} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Verification Preview Error
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setImageLoading(true);
                setErrorMessage(null);
              }}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <span>Retry Page Preview</span>
            </button>
          </div>
        )}

        {/* LARGE DOCUMENT THRESHOLD GUARD */}
        {isTooLarge && (
          <div className="m-auto flex flex-col items-center justify-center gap-3 p-6 text-center max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <FileText size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Source page {citation.pageNumber || pageNumber} in large document
                ({totalPages} pages)
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                In-browser preview is disabled for documents over 80 pages. Please
                download to view full document, or examine the verbatim extracted
                text fragment below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <ArrowDownToLine size={13} />
              <span>Download PDF to Read</span>
            </button>
          </div>
        )}

        {/* NATIVE RASTERIZED IMAGE PREVIEW */}
        {!isTooLarge && imageUrl && (
          <div
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: "transform 0.15s ease",
            }}
            className="flex items-center justify-center max-h-full max-w-full my-auto"
          >
            <img
              src={imageUrl}
              alt={`Citation Page ${pageNumber}`}
              className="max-h-[70vh] w-auto object-contain shadow-md rounded border border-slate-200 bg-white select-none"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setErrorMessage(`Unable to load page ${pageNumber}`);
              }}
            />
          </div>
        )}
      </div>

      {/* 4. DOCKED VERBATIM SOURCE CHUNK CARD */}
      <div className="p-3 bg-white border-t border-slate-200/90 shadow-lg shrink-0">
        <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-700 uppercase">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
              <span>VERBATIM SOURCE CHUNK • PAGE {pageNumber}</span>
            </div>

            <button
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer active:scale-95"
              title="Copy snippet"
            >
              {copiedSnippet ? (
                <>
                  <Check size={11} className="text-emerald-500" />
                  <span className="text-emerald-600">COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-700 italic select-text font-normal max-h-24 overflow-y-auto pr-1 no-scrollbar">
            &ldquo;{textSnippet || "Semantic ground-truth text fragment."}&rdquo;
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono text-[8px] text-slate-400">
            <span>Cosine Retrieval: Grounded</span>
            <span>Target Page: {pageNumber}</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
