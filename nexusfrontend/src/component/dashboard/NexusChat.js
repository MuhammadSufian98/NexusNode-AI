"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  User,
  ArrowUp,
  Folder,
  FileText,
  Upload,
  ChevronLeft,
  Sparkles,
  Search,
  BookOpen,
  Trash2,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Edit3,
  StopCircle,
} from "lucide-react";
import { useGlobal } from "@/store/globalStore";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// Helper to extract clean raw text recursively
const extractRawText = (children) => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractRawText).join("");
  if (children?.props?.children) return extractRawText(children.props.children);
  return "";
};

// Shimmer Skeleton Loader for switching chat sessions with smooth 3-color gradient
function ChatSessionSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-3xl mx-auto w-full py-4"
    >
      {/* Assistant skeleton bubble */}
      <div className="flex gap-3 items-start animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/20 via-orange-400/20 to-amber-300/20 border border-rose-200/50 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1 max-w-[78%]">
          <div className="h-3 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 rounded-md w-1/4" />
          <div className="p-4 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-tl-none space-y-2.5">
            <div className="h-3 bg-slate-100 rounded-md w-full" />
            <div className="h-3 bg-slate-100 rounded-md w-11/12" />
            <div className="h-3 bg-slate-100 rounded-md w-3/4" />
          </div>
        </div>
      </div>

      {/* User skeleton bubble */}
      <div className="flex gap-3 items-start flex-row-reverse animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-900 shrink-0 mt-0.5 border border-slate-700" />
        <div className="space-y-2 flex-1 max-w-[65%] flex flex-col items-end">
          <div className="h-3 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 rounded-md w-1/5" />
          <div className="p-3.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-2xl rounded-tr-none w-full space-y-2">
            <div className="h-3 bg-slate-600 rounded-md w-4/5 ml-auto" />
            <div className="h-3 bg-slate-600 rounded-md w-1/2 ml-auto" />
          </div>
        </div>
      </div>

      {/* Second Assistant skeleton bubble */}
      <div className="flex gap-3 items-start animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/20 via-orange-400/20 to-amber-300/20 border border-rose-200/50 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1 max-w-[82%]">
          <div className="h-3 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 rounded-md w-1/4" />
          <div className="p-4 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-tl-none space-y-2.5">
            <div className="h-3 bg-slate-100 rounded-md w-full" />
            <div className="h-3 bg-slate-100 rounded-md w-4/5" />
            <div className="h-3 bg-slate-100 rounded-md w-2/3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Shimmer Skeleton for session list loading
function SessionListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 bg-white/70 border border-slate-200/70 rounded-xl space-y-2"
        >
          <div className="h-3 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 rounded-md w-3/5" />
          <div className="h-2.5 bg-slate-100 rounded-md w-2/5" />
        </div>
      ))}
    </div>
  );
}

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
        className="px-1.5 py-0.5 rounded-md bg-rose-50/80 text-rose-600 font-mono text-[11px] font-semibold border border-rose-200/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group/code rounded-xl overflow-hidden my-3 border border-slate-800 bg-slate-950 w-full">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 select-none">
        <span>{match ? match[1] : "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]"
        >
          {copied ? (
            <Check size={11} className="text-emerald-400" />
          ) : (
            <Copy size={11} />
          )}
          <span>{copied ? "COPIED" : "COPY"}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[11px] font-mono text-slate-100 leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

function MarkdownRenderer({ text }) {
  return (
    <div className="prose max-w-none text-xs lg:text-[13px] leading-relaxed text-slate-800 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-headings:mt-3 prose-headings:mb-1.5 prose-h1:text-sm prose-h1:lg:text-base prose-h2:text-xs prose-h2:lg:text-sm prose-h3:text-xs prose-p:my-1.5 prose-ul:list-disc prose-ul:pl-4 prose-ul:my-1 prose-ol:list-decimal prose-ol:pl-4 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-slate-900 prose-table:w-full prose-table:border-collapse prose-table:my-2 prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:p-2 prose-th:text-[10px] prose-th:font-bold prose-th:uppercase prose-th:text-slate-600 prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-td:text-[11px] prose-td:text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CustomCodeBlock,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function CitationInspector({ citations }) {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2 w-full select-none">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 hover:from-rose-100 hover:via-orange-100 hover:to-amber-100 rounded-lg text-[9px] font-bold text-slate-700 uppercase tracking-wider border border-rose-200/80 transition-all cursor-pointer"
      >
        <BookOpen size={10} className="text-rose-500" />
        {expanded ? "Hide Sources" : `Verified Sources (${citations.length})`}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-2 p-2.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl space-y-2 overflow-hidden"
          >
            {citations.map((c, i) => (
              <div
                key={i}
                className="text-[10px] leading-relaxed border-b border-slate-200/60 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 rounded-full shrink-0" />
                  {c.fileName || "Referenced File"}
                </div>
                <p className="font-normal text-slate-600 bg-slate-50/70 p-2 rounded-lg border border-slate-200/80 italic">
                  "
                  {c.textSnippet ||
                    "Context fragment extracted from vector index."}
                  "
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MessageBubble = React.memo(
  ({
    msg,
    editingMessageId,
    editingText,
    setEditingMessageId,
    setEditingText,
    editMessagePrompt,
  }) => {
    const isUser = msg.role === "user";

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
            isUser
              ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white"
              : "bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border-rose-200/70 text-rose-600"
          }`}
        >
          {isUser ? <User size={13} /> : <Bot size={13} />}
        </div>

        <div
          className={`flex flex-col gap-1 max-w-[85%] lg:max-w-[75%] ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {isUser && editingMessageId === msg.id ? (
            <div className="flex flex-col gap-2 w-full min-w-[260px]">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full p-2.5 bg-white text-slate-900 border border-rose-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium resize-none min-h-[60px]"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditingText("");
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (
                      editingText.trim() &&
                      editingText.trim() !== msg.content
                    ) {
                      await editMessagePrompt(msg.id, editingText);
                    }
                    setEditingMessageId(null);
                    setEditingText("");
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-opacity cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group/bubble flex items-start gap-1">
              {isUser && (
                <button
                  onClick={() => {
                    setEditingMessageId(msg.id);
                    setEditingText(msg.content);
                  }}
                  className="opacity-0 group-hover/bubble:opacity-100 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all shrink-0 self-center cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 size={11} />
                </button>
              )}

              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs lg:text-[13px] leading-relaxed border ${
                  isUser
                    ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white rounded-tr-none font-normal"
                    : "bg-white/95 border-slate-200/90 text-slate-800 rounded-tl-none font-normal"
                }`}
              >
                {isUser ? (
                  msg.content
                ) : msg.content ? (
                  <MarkdownRenderer text={msg.content} />
                ) : (
                  <div className="flex gap-1.5 items-center py-1 px-1">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-1.5 h-1.5 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isUser && msg.isEdited && (
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Edited
            </span>
          )}

          {!isUser && msg.citations && (
            <CitationInspector citations={msg.citations} />
          )}
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

export default function NexusChatInterface() {
  const selectedDocument = useGlobal((state) => state.selectedDocument);
  const setSelectedDocument = useGlobal((state) => state.setSelectedDocument);
  const setActiveSection = useGlobal((state) => state.setActiveSection);
  const handleFileUpload = useGlobal((state) => state.handleFileUpload);
  const documents = useGlobal((state) => state.documents);
  const messages = useGlobal((state) => state.messages);
  const sendMessage = useGlobal((state) => state.sendMessage);
  const isProcessing = useGlobal((state) => state.isProcessing);
  const activeConversationId = useGlobal((state) => state.activeConversationId);
  const loadUserChatThreads = useGlobal((state) => state.loadUserChatThreads);
  const deleteChatSession = useGlobal((state) => state.deleteChatSession);
  const editMessagePrompt = useGlobal((state) => state.editMessagePrompt);
  const cancelGeneration = useGlobal((state) => state.cancelGeneration);
  const selectDocument = useGlobal((state) => state.selectDocument);
  const createSession = useGlobal((state) => state.createSession);
  const loadSessionMessages = useGlobal((state) => state.loadSessionMessages);
  const conversations = useGlobal((state) => state.conversations);

  const [inputValue, setInputValue] = useState("");
  const [mobileSubView, setMobileSubView] = useState("chat");
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingSessionsList, setIsLoadingSessionsList] = useState(false);
  const scrollRef = useRef(null);
  const uploadInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const lastLoadedDocId = useRef(null);

  // Auto-scroll management
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isProcessing ? "auto" : "smooth",
      });
    }
  }, [messages, isProcessing]);

  // Document session loader with structural loading state
  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      if (selectedDocument) {
        if (lastLoadedDocId.current !== selectedDocument.id) {
          setIsLoadingSessionsList(true);
          try {
            await loadUserChatThreads(selectedDocument.id);
          } finally {
            if (isMounted) setIsLoadingSessionsList(false);
          }
          lastLoadedDocId.current = selectedDocument.id;
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

  // Handle session selection with structural skeleton loader
  const handleSelectSession = async (sessionId) => {
    if (activeConversationId === sessionId) return;
    setIsLoadingSession(true);
    try {
      await loadSessionMessages(sessionId);
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setIsLoadingSession(false);
    }
  };

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

  const sampleQuestions = [
    "Summarize the key objectives of this document",
    "List critical methodologies or frameworks referenced",
    "Extract any numeric findings, metrics, and dates",
    "Identify limitations or future scope mentioned",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex bg-gradient-to-br from-slate-50 via-rose-50/20 to-orange-50/30 border border-slate-200 rounded-2xl lg:rounded-3xl overflow-hidden h-full min-h-0 w-full"
    >
      {/* SIDEBAR PANEL */}
      <div
        className={`w-full lg:w-72 xl:w-80 flex flex-col bg-white/80 backdrop-blur-md border-r border-slate-200 transition-all shrink-0 ${
          selectedDocument
            ? mobileSubView === "chat"
              ? "hidden lg:flex"
              : "flex"
            : "flex"
        }`}
      >
        <div className="p-3.5 space-y-3 border-b border-slate-100 shrink-0">
          <AnimatePresence mode="wait">
            {!selectedDocument ? (
              <motion.div
                key="files-header"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900">
                    Document Workspace
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select a source file
                  </p>
                </div>
                <div className="w-7 h-7 bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-400 rounded-lg flex items-center justify-center text-white border border-rose-300/40">
                  <Folder size={13} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sessions-header"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-50/60 via-orange-50/60 to-amber-50/60 border border-rose-200/70 p-2 rounded-xl"
              >
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-1 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Back to file list"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-bold text-rose-600 uppercase tracking-wider">
                    Current Document
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 truncate">
                    {selectedDocument.name}
                  </div>
                </div>
                {activeConversationId && (
                  <button
                    onClick={() => setMobileSubView("chat")}
                    className="lg:hidden px-2 py-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-md text-[9px] font-bold uppercase tracking-wider"
                  >
                    View Chat
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDocument && (
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={13}
              />
              <input
                type="text"
                placeholder="Filter files..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-2.5 text-xs font-medium focus:bg-white focus:border-rose-400 outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!selectedDocument ? (
              <motion.div
                key="files-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                {documents.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/60 flex items-center justify-center text-rose-500 mb-2">
                      <FileText size={18} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      No Documents Found
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Upload a PDF in the knowledge vault to start querying.
                    </p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => selectDocument(doc)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors text-left border ${
                        selectedDocument?.id === doc.id
                          ? "bg-gradient-to-r from-rose-50 via-orange-50/50 to-amber-50/30 border-rose-300 text-slate-900"
                          : "bg-white/80 hover:bg-slate-50 border-slate-200/70 text-slate-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 text-slate-500 border border-slate-200/80">
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-slate-800">
                          {doc.name}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                          {doc.size} • {doc.pages} Pages
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sessions-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                <button
                  onClick={() => createSession(selectedDocument.id)}
                  disabled={
                    isProcessing || selectedDocument?.status !== "ready"
                  }
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-95 text-white text-[11px] font-bold uppercase tracking-wider transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 border border-rose-400/40"
                >
                  <Sparkles size={13} />
                  New Session
                </button>

                {isLoadingSessionsList ? (
                  <SessionListSkeleton />
                ) : conversations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-[11px]">
                    No conversation sessions yet.
                  </div>
                ) : (
                  conversations.map((session, index) => {
                    const sessionId = session._id || session.id;
                    const isActive = activeConversationId === sessionId;
                    return (
                      <div
                        key={sessionId}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors group/session border ${
                          isActive
                            ? "bg-gradient-to-r from-rose-50 via-orange-50/50 to-amber-50/30 border-rose-300 text-slate-900"
                            : "bg-white/80 hover:bg-slate-50 border-slate-200/70 text-slate-600"
                        }`}
                      >
                        <button
                          onClick={() => handleSelectSession(sessionId)}
                          className="flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <div className="text-[11px] font-bold truncate flex items-center gap-1.5">
                            <MessageSquare
                              size={11}
                              className={
                                isActive ? "text-rose-500" : "text-slate-400"
                              }
                            />
                            Session {conversations.length - index}
                          </div>
                          <div className="text-[8px] font-semibold text-slate-400 mt-0.5 pl-4 uppercase tracking-wider">
                            {new Date(
                              session.updatedAt || session.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(sessionId);
                          }}
                          className="opacity-0 group-hover/session:opacity-100 p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all shrink-0 cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CHAT MAIN PANEL */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 bg-transparent ${
          selectedDocument
            ? mobileSubView === "chat"
              ? "flex"
              : "hidden lg:flex"
            : "hidden lg:flex"
        }`}
      >
        {selectedDocument ? (
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* TOP HEADER */}
            <div className="h-14 px-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setMobileSubView("history")}
                  className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="w-8 h-8 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-lg flex items-center justify-center">
                  <Bot size={15} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xs lg:text-sm text-slate-900 leading-tight">
                    Document Intelligence
                  </h3>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                    Grounding Active • RAG System
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDocument(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close chat"
              >
                <X size={15} />
              </button>
            </div>

            {/* MESSAGES VIEWPORT */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar"
            >
              <AnimatePresence mode="wait">
                {isLoadingSession ? (
                  <ChatSessionSkeleton key="session-loader" />
                ) : messages.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full max-w-lg mx-auto flex flex-col items-center justify-center text-center p-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-rose-500 mb-3">
                      <HelpCircle size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Explore & Query This Document
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-normal">
                      Select a starter prompt below or enter an exploratory
                      inquiry.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-6">
                      {sampleQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputValue(q);
                            textareaRef.current?.focus();
                          }}
                          className="p-3 text-[11px] font-medium text-slate-700 bg-white/90 hover:bg-gradient-to-r hover:from-rose-50/50 hover:via-orange-50/30 hover:to-amber-50/20 border border-slate-200 rounded-xl transition-all text-left cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="message-stream"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 max-w-3xl mx-auto w-full"
                  >
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        editingMessageId={editingMessageId}
                        editingText={editingText}
                        setEditingMessageId={setEditingMessageId}
                        setEditingText={setEditingText}
                        editMessagePrompt={editMessagePrompt}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* INPUT PANEL */}
            <div className="p-3 border-t border-slate-200 bg-white/80 backdrop-blur-md shrink-0">
              <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-50/90 border border-slate-200 rounded-xl p-1.5 focus-within:border-rose-400 focus-within:bg-white transition-colors">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={
                    selectedDocument?.status !== "ready"
                      ? "Document is indexing..."
                      : isProcessing
                        ? "Generating grounded answer..."
                        : "Type your query (Enter to send, Shift+Enter for newline)..."
                  }
                  disabled={
                    isProcessing || selectedDocument?.status !== "ready"
                  }
                  className="flex-1 bg-transparent px-2.5 py-1.5 focus:outline-none text-xs font-normal text-slate-800 placeholder:text-slate-400 resize-none max-h-32 disabled:opacity-50"
                />

                {isProcessing ? (
                  <button
                    onClick={cancelGeneration}
                    className="h-8 px-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    <StopCircle size={13} />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={
                      !inputValue.trim() || selectedDocument?.status !== "ready"
                    }
                    className="w-8 h-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-lg flex items-center justify-center hover:from-rose-600 hover:via-rose-500 hover:to-orange-500 disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all cursor-pointer shrink-0"
                  >
                    <ArrowUp size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {documents.length === 0 ? (
              <>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 rounded-xl flex items-center justify-center border border-rose-200/80 text-rose-600 mb-3">
                  <Upload size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Academic Source
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Provide a PDF file to trigger document parsing and vector
                  indexing.
                </p>
                <div className="mt-4 flex gap-2 w-full max-w-xs">
                  <button
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer border border-rose-400/40"
                  >
                    Upload PDF
                  </button>
                  <button
                    onClick={() => setActiveSection("documents")}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Open Vault
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 rounded-xl flex items-center justify-center border border-rose-200/80 text-rose-500 mb-3">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Select a Document
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Click on an uploaded PDF from the sidebar to inspect
                  references and ask grounded questions.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
