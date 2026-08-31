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
import { useChatStore, useDocumentStore, useUiStore } from "@/store";
import { extractRawText } from "@/utils/textSanitizers";
import { truncateText } from "@/utils/formatters";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

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
      <div className="flex gap-3 items-start justify-end animate-pulse">
        <div className="space-y-2 flex-1 max-w-[65%] flex flex-col items-end">
          <div className="h-3 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 rounded-md w-1/5" />
          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tr-none space-y-2 w-full">
            <div className="h-3 bg-slate-700 rounded-md w-full" />
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
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-slate-100 leading-relaxed custom-scrollbar">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const CustomCitationsAccordion = ({ citations }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer py-1"
      >
        <BookOpen size={13} className="text-rose-500 shrink-0" />
        <span className="text-[11px]">
          {citations.length} Grounded Context Reference
          {citations.length > 1 ? "s" : ""}
        </span>
        <ChevronLeft
          size={12}
          className={`transition-transform duration-200 ml-0.5 ${
            isOpen ? "-rotate-90" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 mt-2"
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
                  "{c.textSnippet || c.snippet || "Context fragment extracted from vector index."}"
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
                className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium text-slate-800 resize-none shadow-sm"
                rows={3}
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setEditingMessageId(null)}
                  className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!editingText.trim()) return;
                    await editMessagePrompt(msg.id, editingText);
                    setEditingMessageId(null);
                  }}
                  className="px-3 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-rose-600 to-orange-500 rounded-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Save & Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group/msg">
              <div
                className={`p-3 md:p-4 rounded-2xl text-xs md:text-[13px] leading-relaxed shadow-sm font-sans relative ${
                  isUser
                    ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-tr-none border border-slate-700/60"
                    : "bg-white/90 backdrop-blur-md text-slate-800 rounded-tl-none border border-slate-200/90"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap font-medium select-text">
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
                          <p className="mb-2.5 last:mb-0 leading-relaxed font-normal" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-4 mb-2.5 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-4 mb-2.5 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-slate-950" {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {msg.citations && msg.citations.length > 0 && (
                      <CustomCitationsAccordion citations={msg.citations} />
                    )}
                  </div>
                )}
              </div>

              {isUser && !editingMessageId && (
                <button
                  onClick={() => {
                    setEditingMessageId(msg.id);
                    setEditingText(msg.content);
                  }}
                  className="opacity-0 group-hover/msg:opacity-100 transition-opacity absolute -left-7 top-2 text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-100 rounded-md cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[9px] font-medium text-slate-400">
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </span>
            {msg.isEdited && (
              <span className="text-[8px] font-semibold text-rose-500 uppercase tracking-wider">
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
  }
);

MessageBubble.displayName = "MessageBubble";

export function ChatView() {
  const selectedDocument = useDocumentStore((state) => state.selectedDocument);
  const setSelectedDocument = useDocumentStore((state) => state.setSelectedDocument);
  const handleFileUpload = useDocumentStore((state) => state.handleFileUpload);
  const documents = useDocumentStore((state) => state.documents);
  const selectDocument = useDocumentStore((state) => state.selectDocument);

  const setActiveSection = useUiStore((state) => state.setActiveSection);

  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isProcessing = useChatStore((state) => state.isProcessing);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const loadUserChatThreads = useChatStore((state) => state.loadUserChatThreads);
  const deleteChatSession = useChatStore((state) => state.deleteChatSession);
  const editMessagePrompt = useChatStore((state) => state.editMessagePrompt);
  const cancelGeneration = useChatStore((state) => state.cancelGeneration);
  const createSession = useChatStore((state) => state.createSession);
  const loadSessionMessages = useChatStore((state) => state.loadSessionMessages);
  const conversations = useChatStore((state) => state.conversations);

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

  // Document session loader
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
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
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
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="p-1.5 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 text-rose-600 rounded-xl hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Upload Document"
                >
                  <Upload size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="threads-header"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedDocument(null);
                      setMobileSubView("files");
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer group"
                  >
                    <ChevronLeft
                      size={14}
                      className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    <span>Switch Doc</span>
                  </button>

                  <button
                    onClick={() => createSession(selectedDocument.id)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white hover:bg-rose-600 px-2.5 py-1 rounded-lg active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <span>+ New Chat</span>
                  </button>
                </div>

                <div className="p-2 bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/60 rounded-xl flex items-center gap-2">
                  <FileText size={14} className="text-rose-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {selectedDocument.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">
                      {selectedDocument.pages || 0} Pages Indexed
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {!selectedDocument ? (
            documents.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Folder size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No Documents</p>
                <p className="text-[10px] text-slate-400">
                  Upload a PDF to begin conversational retrieval.
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDocument(doc)}
                  className="w-full text-left p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white/80 transition-all flex items-center justify-between group cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-rose-600 group-hover:bg-rose-50 transition-colors shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">
                        {doc.size}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )
          ) : isLoadingSessionsList ? (
            <SessionListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <MessageSquare size={20} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No Chat Threads</p>
              <p className="text-[10px] text-slate-400">
                Click "+ New Chat" above to start querying.
              </p>
            </div>
          ) : (
            conversations.map((thread) => {
              const isActive = thread.id === activeConversationId || thread._id === activeConversationId;
              const threadId = thread.id || thread._id;

              return (
                <div
                  key={threadId}
                  className={`group relative rounded-xl border transition-all ${
                    isActive
                      ? "bg-white border-rose-300 shadow-xs"
                      : "bg-white/40 border-slate-200/70 hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <button
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
                    className="w-full text-left p-2.5 pr-8 flex flex-col gap-0.5 cursor-pointer active:scale-98"
                  >
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-rose-600" : "text-slate-700"
                      }`}
                    >
                      {thread.title || "Chat Session"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate font-medium">
                      {thread.lastMessage || "No messages yet"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatSession(threadId);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT FEED */}
      <div
        className={`flex-1 flex flex-col h-full min-h-0 bg-white/40 backdrop-blur-xl relative ${
          selectedDocument && mobileSubView === "files"
            ? "hidden lg:flex"
            : "flex"
        }`}
      >
        {selectedDocument && (
          <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-white/80 shrink-0">
            <button
              onClick={() => setMobileSubView("files")}
              className="flex items-center gap-1 text-xs font-bold text-slate-600"
            >
              <ChevronLeft size={15} />
              <span>Workspace Files</span>
            </button>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
              {selectedDocument.name}
            </span>
          </div>
        )}

        {/* MESSAGE SCROLL REGION */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3.5 md:p-6 space-y-4 md:space-y-6 custom-scrollbar"
        >
          {!selectedDocument ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No Document Selected
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose an existing document from the left panel or upload a new
                PDF to initialize grounding.
              </p>
            </div>
          ) : isLoadingSession ? (
            <ChatSessionSkeleton />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center max-w-lg mx-auto py-6 space-y-4">
              <div className="space-y-1.5 text-center">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Ready to assist with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500">
                    {selectedDocument.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a prompt starter or type your inquiry below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sendMessage(q);
                    }}
                    className="p-3 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-rose-300 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-rose-600 transition-all shadow-2xs active:scale-97 cursor-pointer"
                  >
                    "{q}"
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
              />
            ))
          )}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 items-center text-slate-500 text-xs font-semibold"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={13} />
              </div>
              <div className="flex items-center gap-1.5">
                <span>Grounding insight with citations</span>
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce" />
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* INPUT PROMPT BAR */}
        <div className="p-3 md:p-4 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl shadow-sm focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all p-1.5">
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
                    ? "Ask anything about this document..."
                    : "Select a document to ask questions..."
                }
                rows={1}
                className="w-full bg-transparent px-3 py-1.5 text-xs md:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 disabled:opacity-50"
              />

              <div className="flex items-center gap-1 shrink-0">
                {isProcessing ? (
                  <button
                    onClick={cancelGeneration}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer active:scale-95"
                    title="Stop Generation"
                  >
                    <StopCircle size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={
                      !inputValue.trim() ||
                      !selectedDocument ||
                      selectedDocument.status !== "ready"
                    }
                    className="p-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Send message"
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-2">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="hidden sm:inline">Grounding Vector Core v4.2</span>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </motion.div>
  );
}

export default ChatView;
