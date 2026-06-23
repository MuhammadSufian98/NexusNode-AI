"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  User,
  Send,
  Folder,
  FileText,
  Upload,
  ChevronLeft,
  Sparkles,
  Search,
  Zap,
  Waves,
  Trash2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useGlobal } from "@/store/globalStore";

const parseInlineMarkdown = (text = "") => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong key={i} className="font-extrabold text-slate-900">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const renderMarkdown = (text = "") => {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (line.startsWith("### ")) {
      return (
        <h4
          key={idx}
          className="font-extrabold text-xs lg:text-sm text-slate-900 mt-2 mb-1 uppercase tracking-tight"
        >
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3
          key={idx}
          className="font-black text-sm lg:text-base text-slate-900 mt-3 mb-1.5 uppercase tracking-tight"
        >
          {line.slice(3)}
        </h3>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h2
          key={idx}
          className="font-black text-base lg:text-lg text-slate-900 mt-4 mb-2 uppercase tracking-tight"
        >
          {line.slice(2)}
        </h2>
      );
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().slice(2);
      return (
        <ul
          key={idx}
          className="list-disc pl-4 my-1 text-slate-700 text-xs lg:text-[13px]"
        >
          <li>{parseInlineMarkdown(content)}</li>
        </ul>
      );
    }
    return (
      <p key={idx} className="my-1 min-h-[1rem] text-xs lg:text-[13px]">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

function TypewriterText({ text, isStreaming }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 6);
    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <>{isStreaming ? renderMarkdown(displayedText) : renderMarkdown(text)}</>
  );
}

function CitationInspector({ citations }) {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 w-full select-none">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200/80 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50 transition-all active:scale-[0.97] cursor-pointer"
      >
        <Waves size={8} />
        {expanded ? "Hide References" : `View References (${citations.length})`}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 overflow-hidden"
          >
            {citations.map((c, i) => (
              <div
                key={i}
                className="text-[9px] leading-relaxed border-b border-slate-200/40 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-1.5 font-black text-slate-600 uppercase tracking-wider mb-0.5">
                  <span className="w-1 h-1 bg-rose-500 rounded-full shrink-0" />
                  Source: {c.fileName || "Unknown File"}
                </div>
                <p className="font-medium text-slate-500 bg-white/60 p-1.5 rounded-lg border border-slate-100 shadow-inner italic">
                  "{c.textSnippet || "No snippet available."}"
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NexusChatInterface() {
  const {
    selectedDocument,
    setSelectedDocument,
    setActiveSection,
    handleFileUpload,
    documents,
    messages,
    sendMessage,
    isProcessing,
    activeConversationId,
    conversationsList,
    createNewChatSession,
    loadUserChatThreads,
    selectChatSession,
    deleteChatSession,
    editMessagePrompt,
  } = useGlobal();

  const [inputValue, setInputValue] = useState("");
  const [view, setView] = useState("list");
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const scrollRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    if (selectedDocument) {
      loadUserChatThreads(selectedDocument.id);
      setView("chat");
    } else {
      setView("list");
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (isProcessing && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        setStreamingMessageId(lastMessage.id);
      }
    } else {
      const timer = setTimeout(() => setStreamingMessageId(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, messages]);

  const selectDoc = (doc) => {
    setSelectedDocument(doc);
  };

  const closeDoc = () => {
    setSelectedDocument(null);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const sampleQuestions = [
    "Summarize the main points of this document.",
    "What are the key takeaways or findings?",
    "Find any specific deadlines or requirements mentioned.",
    "Explain the core arguments or thesis statement statement.",
  ];

  const springTransition = { type: "spring", stiffness: 220, damping: 26 };

  return (
    <div className="flex bg-slate-50/50 backdrop-blur-3xl border border-white rounded-3xl lg:rounded-[2rem] shadow-xl overflow-hidden h-full min-h-0 relative">
      {/* LEFT SIDEBAR PANEL */}
      <div
        className={`w-full lg:w-72 xl:w-80 flex flex-col bg-white/40 border-r border-slate-200/50 transition-all duration-500 shrink-0 ${view === "chat" && !selectedDocument ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-3 lg:p-4 space-y-3 shrink-0 bg-white/20">
          <AnimatePresence mode="wait">
            {!selectedDocument ? (
              <motion.div
                key="files-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-base lg:text-lg font-black tracking-tighter text-slate-900">
                    Chats
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Select a Document
                  </p>
                </div>
                <div className="w-8 h-8 bg-linear-to-tr from-rose-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-200">
                  <Folder size={14} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sessions-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-2 rounded-xl relative"
              >
                <button
                  onClick={() => closeDoc()}
                  className="p-1 bg-white border border-slate-200/80 text-slate-500 hover:text-rose-600 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black text-rose-500 uppercase tracking-wider truncate">
                    Active File
                  </div>
                  <div className="text-[11px] font-black text-slate-800 truncate">
                    {selectedDocument.name}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDocument && (
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 outline-none transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 lg:px-3 pb-3 space-y-1.5 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {!selectedDocument ? (
              <motion.div
                key="files-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                {documents.length === 0 ? (
                  <div className="h-full min-h-40 flex flex-col items-center justify-center text-center px-3 pt-8">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 shadow-sm mb-2">
                      <FileText size={20} />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      No PDFs Uploaded
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-relaxed">
                      Your files list will appear here.
                    </p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <motion.button
                      key={doc.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectDoc(doc)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-2xl transition-all relative overflow-hidden ${
                        selectedDocument?.id === doc.id
                          ? "bg-white shadow-md ring-1 ring-slate-100"
                          : "bg-white/40 hover:bg-white/80 border border-transparent hover:border-slate-100"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-slate-100 text-slate-400">
                        <FileText size={15} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[11px] font-black text-slate-800 tracking-tight truncate">
                          {doc.name}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                          {doc.size} • {doc.pages} Pages
                        </p>
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sessions-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={springTransition}
                className="space-y-1.5"
              >
                <div className="p-[1px] rounded-xl bg-linear-to-r from-rose-500 to-orange-400 shadow-sm shadow-orange-100 mb-2">
                  <button
                    onClick={() => createNewChatSession(selectedDocument.id)}
                    className="w-full py-2 px-3 rounded-[11px] bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={12} className="text-orange-500" />
                    New Chat
                  </button>
                </div>

                {conversationsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-[11px] font-medium">
                    No active chat threads. Create a new session.
                  </div>
                ) : (
                  conversationsList.map((thread, index) => {
                    const threadId = thread._id || thread.id;
                    const isActive = activeConversationId === threadId;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        key={threadId}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all relative group/thread ${
                          isActive
                            ? "bg-white shadow-md shadow-slate-200/60 ring-1 ring-slate-100/50 text-slate-900"
                            : "bg-white/30 hover:bg-white/70 text-slate-600"
                        }`}
                      >
                        <button
                          onClick={() => selectChatSession(threadId)}
                          className="flex-1 text-left min-w-0 h-full outline-none cursor-pointer"
                        >
                          <div className="text-[11px] font-black truncate flex items-center gap-1.5">
                            <MessageSquare
                              size={10}
                              className={
                                isActive ? "text-rose-500" : "text-slate-400"
                              }
                            />
                            Chat history {conversationsList.length - index}
                          </div>
                          <div className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter pl-4">
                            {new Date(
                              thread.updatedAt || thread.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(threadId);
                          }}
                          className="opacity-0 group-hover/thread:opacity-100 p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all shrink-0 ml-1 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE CHAT CONTENT PANEL */}
      <div
        className={`flex-1 flex bg-white/20 backdrop-blur-sm ${view === "list" ? "hidden lg:flex" : "flex"}`}
      >
        {selectedDocument ? (
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <div className="h-14 lg:h-16 px-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("list")}
                  className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    <Bot size={16} className="text-rose-500" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-xs lg:text-sm text-slate-900 leading-tight tracking-tight">
                    Nexus Assistant
                  </h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
                    <Sparkles size={8} className="text-rose-500" /> Active Chat
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => closeDoc()}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 lg:p-5 space-y-4 custom-scrollbar bg-slate-50/30"
            >
              {messages.length === 0 ? (
                <div className="h-full max-w-md mx-auto flex flex-col items-center justify-center text-center p-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 shadow-xs mb-3">
                    <HelpCircle size={18} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    Ask questions about your PDF
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs leading-relaxed font-medium">
                    Choose one of the common starting points below or type a
                    custom question.
                  </p>

                  <div className="grid grid-cols-1 gap-2 w-full mt-6 text-left">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputValue(q)}
                        className="p-3 text-[11px] font-bold text-slate-600 bg-white hover:bg-rose-50/30 border border-slate-200/60 rounded-xl transition-all hover:border-rose-200 text-left cursor-pointer shadow-xs"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, idx) => {
                    const isStreaming = msg.id === streamingMessageId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 mt-0.5 ${
                            msg.role === "user"
                              ? "bg-slate-900 text-white"
                              : "bg-white border border-slate-100 text-rose-500"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User size={13} />
                          ) : (
                            <Bot size={13} />
                          )}
                        </div>

                        <div
                          className={`flex flex-col gap-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                          {msg.role === "user" &&
                          editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-1.5 w-full min-w-[240px]">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full p-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none min-h-[50px]"
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditingText("");
                                  }}
                                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    if (
                                      editingText.trim() &&
                                      editingText.trim() !== msg.content
                                    ) {
                                      await editMessagePrompt(
                                        msg.id,
                                        editingText,
                                      );
                                    }
                                    setEditingMessageId(null);
                                    setEditingText("");
                                  }}
                                  className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-xs cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/bubble flex items-start gap-1.5">
                              {msg.role === "user" && (
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingText(msg.content);
                                  }}
                                  className="opacity-0 group-hover/bubble:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-all shrink-0 self-center cursor-pointer"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </button>
                              )}
                              <div
                                className={`px-3.5 py-2.5 rounded-xl text-xs lg:text-[13px] leading-relaxed shadow-xs ${
                                  msg.role === "user"
                                    ? "bg-slate-900 text-white rounded-tr-none font-medium"
                                    : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none font-medium"
                                }`}
                              >
                                {msg.role === "user" ? (
                                  msg.content
                                ) : (
                                  <TypewriterText
                                    text={msg.content}
                                    isStreaming={isStreaming}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {msg.role === "user" && msg.isEdited && (
                            <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mt-0.5">
                              (Edited)
                            </span>
                          )}

                          {msg.role === "assistant" && msg.citations && (
                            <CitationInspector citations={msg.citations} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {isProcessing && streamingMessageId === null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-xs">
                    <Bot size={13} className="text-rose-500 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-xl rounded-tl-none shadow-xs flex gap-1 items-center">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-1.5 h-1.5 bg-rose-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-2.5 bg-white/80 backdrop-blur-xl border-t border-slate-100 shrink-0">
              <div className="max-w-4xl mx-auto flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:shadow-lg focus-within:border-rose-300 transition-all duration-300">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask a question...`}
                  className="flex-1 bg-transparent px-2.5 py-1 focus:outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-xs hover:bg-rose-600 disabled:bg-slate-200 disabled:shadow-none transition-all cursor-pointer shrink-0"
                >
                  <Send size={11} fill="currentColor" />
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 text-center bg-linear-to-b from-transparent to-slate-50/50">
            {documents.length === 0 ? (
              <>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-slate-100">
                    <Upload size={24} className="text-rose-500" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-2 border border-dashed border-rose-200 rounded-full"
                  />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tighter">
                  No Documents Found
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Upload a standard PDF file to generate a working chat
                  instance.
                </p>
                <div className="mt-4 flex gap-2 w-full max-w-xs">
                  <button
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-rose-500 transition-colors cursor-pointer shadow-xs"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setActiveSection("documents")}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                  >
                    View Vault
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-slate-100">
                    <MessageSquare size={24} className="text-slate-300" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-2 border border-dashed border-rose-100 rounded-full"
                  />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tighter">
                  Select a Document
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Choose an item from the sidebar parameters to populate or
                  modify active threads.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
