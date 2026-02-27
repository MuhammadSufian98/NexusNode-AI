"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Folder,
  FileText,
  ChevronRight,
  Clock,
  Activity,
  Zap,
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
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isProcessing]);

  const handleSend = () => {
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)] overflow-hidden">
      {/* --- LEFT: CHAT STAGE (8 Cols) --- */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden relative">
        <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <MessageSquare className="text-rose-600" size={18} />
            </div>
            <div>
              <h2 className="font-black text-xs tracking-widest uppercase text-slate-900">
                Neural Dialogue
              </h2>
              {selectedDocument && (
                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
                  Active: {selectedDocument.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isProcessing ? "bg-orange-500 animate-pulse" : "bg-emerald-500"}`}
            />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Engine v4.2
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                <Bot size={32} className="text-rose-600/20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                Awaiting Neural Input
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${msg.role === "user" ? "bg-linear-to-tr from-rose-600 to-orange-500 border-none" : "bg-white border-slate-100"}`}
                  >
                    {msg.role === "user" ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-rose-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}
                  >
                    <div
                      className={`p-4 rounded-3xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 rounded-tl-none text-slate-700"}`}
                    >
                      {msg.content}
                    </div>
                    {msg.sources && (
                      <div className="flex items-center gap-1 mt-2 justify-start">
                        <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          Source: Page {msg.sources[0].page}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                <Activity size={16} className="text-rose-600 animate-spin" />
              </div>
              <div className="p-4 bg-slate-100 rounded-3xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-5 border-t border-slate-50 bg-white">
          <div className="flex gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-rose-300 transition-all shadow-inner">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                selectedDocument
                  ? `Ask about ${selectedDocument.name}...`
                  : "Select a document to begin..."
              }
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-[13px] font-semibold text-slate-700"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !selectedDocument}
              className="p-3.5 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT: SIDEBAR (4 Cols) --- */}
      <div className="lg:col-span-4 flex flex-col gap-5 overflow-hidden">
        {/* Context Vault */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col min-h-0 max-h-[65%] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Folder size={16} className="text-rose-600" />
              </div>
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">
                Knowledge Base
              </h3>
            </div>
            <span className="text-[10px] font-black text-slate-400">
              {documents.length} Assets
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedDocument?.id === doc.id ? "bg-rose-50 border-rose-200 shadow-md shadow-rose-100" : "bg-white border-slate-50 hover:border-slate-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg ${selectedDocument?.id === doc.id ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      <FileText size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black truncate text-slate-800 uppercase">
                        {doc.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {doc.pages} Pages • {doc.size}
                      </p>
                    </div>
                  </div>
                  {selectedDocument?.id === doc.id && (
                    <Zap size={12} className="text-rose-600 fill-rose-600" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engine Diagnostics */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100/40 blur-2xl rounded-full pointer-events-none" />

          <h3 className="relative z-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Activity size={14} className="text-rose-500 animate-pulse" />
            Diagnostics
          </h3>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            {/* Inference Card */}
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl transition-colors group-hover:bg-white">
              <p className="text-2xl font-black text-slate-900 tracking-tighter">
                {messages.length}
              </p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Inference
              </p>
            </div>

            {/* Latency Card */}
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl transition-colors group-hover:bg-white">
              <p className="text-2xl font-black text-rose-600 tracking-tighter">
                0.8s
              </p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Latency
              </p>
            </div>
          </div>

          {/* Bottom decorative bar */}
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/3 bg-linear-to-r from-transparent via-rose-500 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
