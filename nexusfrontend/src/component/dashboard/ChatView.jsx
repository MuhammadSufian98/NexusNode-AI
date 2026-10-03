"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  ArrowUp,
  Folder,
  FileText,
  Upload,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  BookOpen,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  Edit3,
  StopCircle,
  Hash,
  Compass,
  CornerDownLeft,
  Eye,
} from "lucide-react";
import { useChatStore, useDocumentStore, useUiStore } from "@/store";
import { extractRawText } from "@/utils/textSanitizers";
import { truncateText } from "@/utils/formatters";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/component/PdfViewer"), {
  ssr: false,
});
const CitationInspectorPanel = dynamic(
  () => import("@/component/dashboard/CitationInspectorPanel"),
  { ssr: false }
);

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// -------------------------------------------------------------
// SKELETON LOADERS
// -------------------------------------------------------------
function ChatSessionSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full py-6 px-2">
      {/* Assistant Skeleton Bubble */}
      <div className="flex gap-3 items-start animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-slate-200/70 border border-slate-300/60 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1 max-w-[80%]">
          <div className="h-2.5 bg-slate-200/70 rounded-full w-24" />
          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl rounded-tl-sm space-y-2.5">
            <div className="h-3 bg-slate-200/60 rounded-md w-full" />
            <div className="h-3 bg-slate-200/60 rounded-md w-11/12" />
            <div className="h-3 bg-slate-200/60 rounded-md w-3/4" />
          </div>
        </div>
      </div>

      {/* User Skeleton Bubble */}
      <div className="flex gap-3 items-start justify-end animate-pulse">
        <div className="space-y-2 flex-1 max-w-[65%] flex flex-col items-end">
          <div className="h-2.5 bg-slate-200/70 rounded-full w-16" />
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tr-sm space-y-2 w-full">
            <div className="h-3 bg-slate-700 rounded-md w-full" />
            <div className="h-3 bg-slate-600 rounded-md w-2/3 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="space-y-1.5 animate-pulse p-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 bg-white/50 border border-slate-200/60 rounded-xl space-y-1.5"
        >
          <div className="h-3 bg-slate-200/70 rounded-md w-3/4" />
          <div className="h-2 bg-slate-100 rounded-md w-1/2" />
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// CODE HIGHLIGHTING BLOCK
// -------------------------------------------------------------
const CustomCodeBlock = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const isBlock = match || String(children).includes("\n");
  const [copied, setCopied] = useState(false);
  const rawCode = extractRawText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  if (!isBlock) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-mono text-[11px] font-semibold border border-rose-200/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group/code rounded-xl overflow-hidden my-3 border border-slate-800 bg-[#0A0D14] w-full">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#10141E] border-b border-slate-800 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 select-none">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Hash size={11} className="text-rose-400" />
          {match ? match[1] : "terminal"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[11px] sm:text-xs font-mono text-slate-100 leading-relaxed no-scrollbar">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// -------------------------------------------------------------
// VERBATIM CITATIONS ACCORDION
// -------------------------------------------------------------
const CustomCitationsAccordion = ({ citations, onSelectCitation }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-200/70">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-600 hover:text-rose-600 font-semibold transition-colors cursor-pointer py-0.5"
      >
        <div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
          <BookOpen size={11} />
        </div>
        <span className="font-mono text-[11px] font-bold">
          {citations.length} Ground-Truth Reference
          {citations.length > 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-rose-600" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden space-y-2 mt-2.5"
          >
            {citations.map((c, i) => (
              <div
                key={i}
                onClick={() => onSelectCitation && onSelectCitation(c, citations)}
                className="text-[11px] leading-relaxed border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-rose-300 hover:shadow-xs p-2.5 rounded-xl transition-all cursor-pointer group/cit active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover/cit:text-rose-600 font-mono text-[10px] uppercase truncate transition-colors">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                    <span>{c.documentName || c.fileName || "Source Document"}</span>
                    {c.pageNumber && (
                      <span className="text-slate-400 font-normal lowercase">
                        • pg {c.pageNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {(c.similarityScore || c.score) && (
                      <span className="font-mono text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                        {Math.round((c.similarityScore || c.score) * 100)}% Match
                      </span>
                    )}
                    <span className="text-rose-600 text-[9px] font-mono font-bold opacity-0 group-hover/cit:opacity-100 transition-opacity ml-1 flex items-center gap-0.5">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
                <p className="font-normal text-slate-600 italic">
                  &ldquo;
                  {c.textSnippet ||
                    c.snippet ||
                    "Context fragment extracted from vector index."}
                  &rdquo;
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -------------------------------------------------------------
// MESSAGE BUBBLE COMPONENT
// -------------------------------------------------------------
const MessageBubble = React.memo(
  ({
    msg,
    editingMessageId,
    editingText,
    setEditingMessageId,
    setEditingText,
    editMessagePrompt,
    onSelectCitation,
  }) => {
    const isUser = msg.role === "user";

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`flex gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar Shield */}
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
            isUser
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border-rose-200/70 text-rose-600"
          }`}
        >
          {isUser ? <User size={13} /> : <Bot size={13} />}
        </div>

        {/* Message Content Container */}
        <div
          className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[80%] ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {isUser && editingMessageId === msg.id ? (
            <div className="flex flex-col gap-2 w-full min-w-[280px]">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 font-medium text-slate-800 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingMessageId(null)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!editingText.trim()) return;
                    await editMessagePrompt(msg.id, editingText);
                    setEditingMessageId(null);
                  }}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-rose-600 to-orange-500 rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group/msg">
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative ${
                  isUser
                    ? "bg-slate-900 text-white rounded-tr-xs border border-slate-800 font-medium"
                    : "bg-white/80 text-slate-800 rounded-tl-xs border border-slate-200/80"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap select-text leading-relaxed">
                    {msg.content}
                  </p>
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none text-slate-800 select-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: CustomCodeBlock,
                        p: ({ node, ...props }) => (
                          <p
                            className="mb-2 last:mb-0 leading-relaxed font-normal"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc pl-4 mb-2 space-y-1"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal pl-4 mb-2 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-slate-950"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {msg.citations && msg.citations.length > 0 && (
                      <CustomCitationsAccordion
                        citations={msg.citations}
                        onSelectCitation={onSelectCitation}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Edit Trigger for User Messages */}
              {isUser && !editingMessageId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessageId(msg.id);
                    setEditingText(msg.content);
                  }}
                  className="opacity-0 group-hover/msg:opacity-100 transition-opacity absolute -left-7 top-2 text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-100 rounded-md cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 size={12} />
                </button>
              )}
            </div>
          )}

          {/* Time & Edited Badges */}
          <div className="flex items-center gap-1.5 px-1">
            <span className="font-mono text-[9px] text-slate-400">
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </span>
            {msg.isEdited && (
              <span className="font-mono text-[8px] font-semibold text-rose-500 uppercase">
                • Edited
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
  (prev, next) => {
    return (
      prev.msg.content === next.msg.content &&
      prev.msg.isEdited === next.msg.isEdited &&
      prev.editingMessageId === next.editingMessageId &&
      (prev.msg.citations?.length || 0) === (next.msg.citations?.length || 0)
    );
  },
);

MessageBubble.displayName = "MessageBubble";

// -------------------------------------------------------------
// MAIN CHAT VIEW
// -------------------------------------------------------------
export function ChatView() {
  const selectedDocument = useDocumentStore((state) => state.selectedDocument);
  const setSelectedDocument = useDocumentStore(
    (state) => state.setSelectedDocument,
  );
  const handleFileUpload = useDocumentStore((state) => state.handleFileUpload);
  const documents = useDocumentStore((state) => state.documents) || [];
  const selectDocument = useDocumentStore((state) => state.selectDocument);

  const messages = useChatStore((state) => state.messages) || [];
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isProcessing = useChatStore((state) => state.isProcessing);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const loadUserChatThreads = useChatStore(
    (state) => state.loadUserChatThreads,
  );
  const deleteChatSession = useChatStore((state) => state.deleteChatSession);
  const editMessagePrompt = useChatStore((state) => state.editMessagePrompt);
  const cancelGeneration = useChatStore((state) => state.cancelGeneration);
  const createSession = useChatStore((state) => state.createSession);
  const loadSessionMessages = useChatStore(
    (state) => state.loadSessionMessages,
  );
  const conversations = useChatStore((state) => state.conversations) || [];

  const [inputValue, setInputValue] = useState("");
  const [mobileSubView, setMobileSubView] = useState("chat");
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingSessionsList, setIsLoadingSessionsList] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [selectedPdfType, setSelectedPdfType] = useState("application/pdf");
  const [selectedPdfPageCount, setSelectedPdfPageCount] = useState(0);
  const [activeCitation, setActiveCitation] = useState(null);
  const [activeCitationList, setActiveCitationList] = useState([]);

  const handleSelectCitation = useCallback((citation, list = []) => {
    setActiveCitation(citation);
    if (list && list.length > 0) {
      setActiveCitationList(list);
    }
  }, []);

  const openPdfViewer = useCallback((doc) => {
    if (!doc) return;
    const docId = doc._id || doc.id;
    if (!docId) return;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/rag/documents/${docId}/preview-stream`;
    setSelectedDocId(String(docId));
    setSelectedPdfUrl(streamUrl);
    setSelectedPdfName(doc.name || doc.fileName || "Document.pdf");
    setSelectedPdfPageCount(Number(doc.pages || doc.totalPageCount || 0));
    setViewerOpen(true);
  }, []);

  const closePdfViewer = useCallback(() => {
    setViewerOpen(false);
    setSelectedDocId("");
    setSelectedPdfUrl("");
    setSelectedPdfName("");
    setSelectedPdfPageCount(0);
  }, []);

  const scrollRef = useRef(null);
  const uploadInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const lastLoadedDocId = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isProcessing ? "auto" : "smooth",
      });
    }
  }, [messages, isProcessing]);

  // Sync threads on document change
  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      if (selectedDocument) {
        const docId = selectedDocument.id || selectedDocument._id;
        if (lastLoadedDocId.current !== docId) {
          setIsLoadingSessionsList(true);
          try {
            await loadUserChatThreads(docId);
          } finally {
            if (isMounted) setIsLoadingSessionsList(false);
          }
          lastLoadedDocId.current = docId;
        }
        setMobileSubView("chat");
      } else {
        lastLoadedDocId.current = null;
      }
    };

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [selectedDocument, loadUserChatThreads]);

  const handleSend = useCallback(() => {
    if (
      !inputValue.trim() ||
      isProcessing ||
      selectedDocument?.status !== "ready"
    )
      return;
    sendMessage(inputValue.trim());
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue, isProcessing, selectedDocument, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = useMemo(
    () => [
      "Synthesize core architecture & hypotheses",
      "List empirical proofs and metrics referenced",
      "Extract formula constraints & edge cases",
      "Draft comprehensive exam revision summary",
    ],
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex h-full min-h-0 w-full overflow-hidden select-none"
    >
      {/* ========================================================= */}
      {/* 1. LEFT WORKSPACE & THREADS DRAWER                        */}
      {/* ========================================================= */}
      <aside
        className={`w-full lg:w-72 xl:w-80 flex flex-col bg-[#F9FAFB]/70 border-r border-slate-200/80 transition-all shrink-0 ${
          selectedDocument
            ? mobileSubView === "chat"
              ? "hidden lg:flex"
              : "flex"
            : "flex"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-slate-200/70 shrink-0">
          <AnimatePresence mode="wait">
            {!selectedDocument ? (
              <motion.div
                key="files-header"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xs font-extrabold tracking-tight text-slate-900 uppercase">
                    Source Vault
                  </h2>
                  <p className="font-mono text-[9px] text-slate-400">
                    Select document to query
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
                  title="Upload Document"
                >
                  <Upload size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="threads-header"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocument(null);
                      setMobileSubView("files");
                    }}
                    className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer group active:scale-[0.98]"
                  >
                    <ChevronLeft
                      size={13}
                      className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    <span>SWITCH_DOC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      createSession(selectedDocument.id || selectedDocument._id)
                    }
                    className="flex items-center gap-1 font-mono text-[9px] font-bold bg-slate-900 text-white hover:bg-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <span>+ NEW_CHAT</span>
                  </button>
                </div>

                {/* Selected File Card */}
                <div className="p-2.5 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-bold text-slate-900 truncate"
                        title={selectedDocument.name}
                      >
                        {selectedDocument.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[9px] font-semibold text-slate-400">
                          {selectedDocument.pages || 1} pgs
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[9px] font-bold text-emerald-600">
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openPdfViewer(selectedDocument)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 shrink-0"
                    title="Preview Document"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable File or Thread List */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1"
          data-lenis-prevent
        >
          {!selectedDocument ? (
            documents.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Folder size={22} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">
                  No Documents Found
                </p>
                <p className="font-mono text-[9px] text-slate-400">
                  Upload a PDF in Documents view to initialize chat.
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  type="button"
                  key={doc.id || doc._id}
                  onClick={() => selectDocument(doc)}
                  className="w-full text-left p-2 rounded-xl border border-transparent hover:border-slate-200/80 hover:bg-white transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-rose-600 group-hover:bg-rose-50 transition-colors shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                        {doc.name}
                      </p>
                      <p className="font-mono text-[9px] text-slate-400">
                        {doc.size || "PDF File"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )
          ) : isLoadingSessionsList ? (
            <SessionListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center space-y-1.5">
              <MessageSquare size={20} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">
                No Active Threads
              </p>
              <p className="font-mono text-[9px] text-slate-400">
                Click + NEW_CHAT to query this document.
              </p>
            </div>
          ) : (
            conversations.map((thread) => {
              const threadId = thread.id || thread._id;
              const isActive = threadId === activeConversationId;

              return (
                <div
                  key={threadId}
                  className={`group relative rounded-xl border transition-all ${
                    isActive
                      ? "bg-white border-rose-200/90"
                      : "bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isActive) {
                        setIsLoadingSession(true);
                        try {
                          await loadSessionMessages(threadId);
                        } finally {
                          setIsLoadingSession(false);
                        }
                      }
                      setMobileSubView("chat");
                    }}
                    className="w-full text-left p-2.5 pr-8 flex flex-col gap-0.5 cursor-pointer active:scale-[0.98]"
                  >
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {thread.title || "Thread Session"}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 truncate">
                      {thread.lastMessage || "No messages recorded"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatSession(threadId);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer active:scale-[0.98]"
                    title="Delete Thread"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. CHAT CANVAS & PROMPT DOCK                              */}
      {/* ========================================================= */}
      <section
        className={`flex-1 flex flex-col h-full min-h-0 bg-transparent relative ${
          selectedDocument && mobileSubView === "files"
            ? "hidden lg:flex"
            : "flex"
        }`}
      >
        {/* Mobile Viewport Header */}
        {selectedDocument && (
          <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-white/95 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSubView("files")}
              className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-600"
            >
              <ChevronLeft size={14} />
              <span>VAULT_INDEX</span>
            </button>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
              {selectedDocument.name}
            </span>
          </div>
        )}

        {/* Message Feed Canvas */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-3.5 sm:p-5 md:p-6 space-y-4 md:space-y-5"
          data-lenis-prevent
        >
          {!selectedDocument ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                <Compass size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Grounding Stage Unassigned
              </h3>
              <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
                Select an active vault document from the drawer or ingest a new
                PDF to initialize contextual embeddings.
              </p>
            </div>
          ) : isLoadingSession ? (
            <ChatSessionSkeleton />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center max-w-lg mx-auto py-8 space-y-4">
              <div className="space-y-1 text-center">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                  Ready to synthesize{" "}
                  <span className="text-rose-600">{selectedDocument.name}</span>
                </h3>
                <p className="font-mono text-[10px] text-slate-400">
                  512-dim vector graph indexed. Select a prompt starter below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {sampleQuestions.map((q, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="p-3 bg-white/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                editingMessageId={editingMessageId}
                editingText={editingText}
                setEditingMessageId={setEditingMessageId}
                setEditingText={setEditingText}
                editMessagePrompt={editMessagePrompt}
                onSelectCitation={handleSelectCitation}
              />
            ))
          )}

          {/* Inference Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 items-center text-slate-500 text-xs font-medium pl-1"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center shrink-0">
                <Sparkles size={12} className="animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                <span>Vectorizing citations & cross-examining context</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce" />
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. INPUT PROMPT COMMAND BAR                              */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 border-t border-slate-200/70 bg-[#F9FAFB]/90 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
            <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all p-1.5">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                disabled={!selectedDocument || isProcessing}
                placeholder={
                  selectedDocument
                    ? "Ask questions, verify formulas, or synthesize chapters..."
                    : "Select a document in the vault to begin..."
                }
                rows={1}
                className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 disabled:opacity-50"
              />

              <div className="flex items-center gap-1 shrink-0 pr-1">
                {isProcessing ? (
                  <button
                    type="button"
                    onClick={cancelGeneration}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
                    title="Cancel Generation"
                  >
                    <StopCircle size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={
                      !inputValue.trim() ||
                      !selectedDocument ||
                      selectedDocument.status !== "ready"
                    }
                    className="p-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-95 text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out"
                    title="Send Prompt"
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Input Metatag Footer */}
            <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 px-2">
              <div className="flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-slate-500">
                  ↵ Enter
                </kbd>
                <span>to send</span>
              </div>
              <span>RAG Engine: 512-dim Grounded</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SLIDE-OVER CITATION INSPECTOR PANEL                   */}
        {/* ========================================================= */}
        <AnimatePresence>
          {activeCitation && (
            <CitationInspectorPanel
              citation={activeCitation}
              allCitations={activeCitationList}
              onSelectCitation={(cit) => setActiveCitation(cit)}
              onClose={() => setActiveCitation(null)}
            />
          )}
        </AnimatePresence>
      </section>

      {/* Hidden File Ingest Input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* PDF / Multi-Media Viewer Modal */}
      {viewerOpen && (
        <PdfViewer
          isOpen={viewerOpen}
          onClose={closePdfViewer}
          documentId={selectedDocId}
          pdfUrl={selectedPdfUrl}
          fileName={selectedPdfName}
          pageCount={selectedPdfPageCount}
          apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
        />
      )}
    </motion.div>
  );
}

export default ChatView;
