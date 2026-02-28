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
  ChevronLeft,
  Sparkles,
  Search,
  MoreHorizontal,
  Pulse,
  Zap,
  Waves,
} from "lucide-react";
import { useGlobal } from "@/context/globalContext";

export default function NexusChatInterface() {
  const {
    selectedDocument,
    setSelectedDocument,
    documents,
    messages,
    sendMessage,
    isProcessing,
  } = useGlobal();

  const [inputValue, setInputValue] = useState("");
  const [view, setView] = useState("list");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isProcessing]);

  const selectDoc = (doc) => {
    setSelectedDocument(doc);
    setView("chat");
  };

  const closeDoc = () => {
    setSelectedDocument(null);
    setView("list");
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex bg-slate-50/50 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-2xl overflow-hidden h-[calc(95vh-140px)] relative">
      {/* --- SIDEBAR: KNOWLEDGE VAULT --- */}
      <div
        className={`w-full lg:w-95 flex flex-col bg-white/40 border-r border-slate-200/50 transition-all duration-500 ${view === "chat" ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-slate-900">
                Vault
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Active Intelligence
              </p>
            </div>
            <div className="w-10 h-10 bg-linear-to-tr from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <Folder size={18} />
            </div>
          </div>

          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Filter nodes..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {documents.map((doc) => (
            <motion.button
              key={doc.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectDoc(doc)}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all relative overflow-hidden ${
                selectedDocument?.id === doc.id
                  ? "bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
                  : "hover:bg-white/60"
              }`}
            >
              {selectedDocument?.id === doc.id && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-y-0 left-0 w-1 bg-rose-500"
                />
              )}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  selectedDocument?.id === doc.id
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <FileText size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-black text-slate-800 tracking-tight">
                  {doc.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                  {doc.size} • {doc.pages} Pages
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div
        className={`flex-1 flex flex-col bg-white/20 backdrop-blur-sm ${view === "list" ? "hidden lg:flex" : "flex"}`}
      >
        {selectedDocument ? (
          <>
            {/* Elegant Header */}
            <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("list")}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-white">
                    <Bot size={22} className="text-rose-500" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-[14px] text-slate-900 leading-tight tracking-tight">
                    Nexus AI Analyst
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} className="text-rose-500" /> Neural
                    Processing Active
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => closeDoc()}
                  className="p-2.5 text-red-400 hover:bg-red-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Flow */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 mt-1 ${
                        msg.role === "user"
                          ? "bg-rose-600 text-white"
                          : "bg-white border border-slate-100 text-slate-800"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Zap size={16} />
                      )}
                    </div>

                    <div
                      className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-5 py-4 rounded-[1.8rem] text-[14px] leading-relaxed shadow-sm transition-all ${
                          msg.role === "user"
                            ? "bg-slate-900 text-white rounded-tr-none font-medium"
                            : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none font-medium"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.sources && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
                          <Waves size={10} /> Context Page {msg.sources[0].page}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Enhanced Dot Animation */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Bot size={16} className="text-rose-500 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 px-6 py-5 rounded-[1.8rem] rounded-tl-none shadow-sm flex gap-1.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-2 h-2 bg-rose-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Futuristic Input Area */}
            <div className="p-2 bg-white/80 backdrop-blur-xl border-t border-slate-100">
              <div className="max-w-4xl mx-auto flex gap-3 p-1 bg-slate-50 border border-slate-200 rounded-4xl focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-rose-500/5 focus-within:border-rose-300 transition-all duration-300">
                <div className="hidden sm:flex items-center pl-4 pr-2 border-r border-slate-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Live
                  </span>
                </div>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    selectedDocument
                      ? `Querying ${selectedDocument.name}...`
                      : "Initialize a node..."
                  }
                  className="flex-1 bg-transparent px-4 py-1 focus:outline-none text-[14px] font-bold text-slate-700 placeholder:text-slate-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 disabled:bg-slate-200 disabled:shadow-none transition-all cursor-pointer"
                >
                  <Send size={18} fill="currentColor" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-linear-to-b from-transparent to-slate-50/50">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100">
                <Bot size={48} className="text-slate-200" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-rose-200 rounded-full"
              />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
              Neural Link Idle
            </h3>
            <p className="text-sm font-medium text-slate-400 mt-3 max-w-sm leading-relaxed">
              Select a data node from the vault to begin real-time neural
              indexing and synthesis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
