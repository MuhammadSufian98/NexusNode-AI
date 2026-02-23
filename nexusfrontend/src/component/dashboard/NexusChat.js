"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Folder,
  FileText,
  ChevronRight,
  Clock,
} from "lucide-react";

export default function NexusChatInterface({
  selectedDocument,
  setSelectedDocument,
  documents,
}) {
  /** * @backend_note { "state": "messages", "type": "Array<ChatMessage>", "description": "Stores current conversation history." }
   */
  const [messages, setMessages] = useState([]);

  /** * @backend_note { "state": "inputValue", "type": "string", "description": "Current prompt string to be sent to the RAG API." }
   */
  const [inputValue, setInputValue] = useState("");

  /** * @backend_note { "state": "isProcessing", "type": "boolean", "description": "Loading state to trigger skeleton UI or bounce animations." }
   */
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now(), role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsProcessing(true);

    // Simulated RAG Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Analysis complete. The requested data has been mapped to vectors.",
          sources: [{ page: 1 }],
        },
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-full max-h-[calc(100vh-140px)] overflow-hidden">
      {/* --- LEFT: NEXUS CHAT STAGE --- */}
      <div className="lg:col-span-2 flex flex-col bg-white/80 backdrop-blur-xl border border-slate-200 rounded-4xl shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Chat Header (Scaled Down) */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 shrink-0">
          <MessageSquare className="text-rose-600" size={18} />
          <h2 className="font-black text-sm tracking-tight">Nexus Chat</h2>
          {selectedDocument && (
            <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-tighter">
              {selectedDocument.name}
            </span>
          )}
        </div>

        {/* Message Area (Internal Scroll Only) */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <Bot size={48} className="text-rose-600 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Initialize Neural Query
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-linear-to-tr from-rose-600 to-orange-500 shadow-md" : "bg-white border border-slate-200"}`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-rose-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-rose-600 text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none text-slate-700"}`}
                  >
                    {msg.content}
                  </div>
                  {msg.sources && (
                    <p className="mt-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                      Ref: Page {msg.sources[0].page}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {isProcessing && (
            <div className="text-[10px] font-bold text-rose-400 animate-pulse uppercase tracking-widest ml-11">
              Nexus Thinking...
            </div>
          )}
        </div>

        {/* Input Dock (Compact) */}
        <div className="p-3 border-t border-slate-100 bg-white/50 shrink-0">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-[13px] font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 disabled:opacity-50 hover:bg-rose-700 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT: VAULT & STATUS SIDEBAR --- */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Document Vault (Scaled max-height) */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-4xl p-4 flex flex-col min-h-0 max-h-[60%] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Folder className="text-rose-600" size={16} />
              <h2 className="font-black text-xs uppercase tracking-tighter">
                Vault
              </h2>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {documents.length} Files
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedDocument?.id === doc.id ? "bg-rose-50 border-rose-200" : "bg-slate-50/50 border-slate-100 hover:border-slate-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText
                      size={14}
                      className="text-rose-600 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black truncate">
                        {doc.name}
                      </p>
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                        {doc.pages} Pgs • {doc.size}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Status Cards (Scaled down) */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-4xl p-4 shadow-sm h-fit">
          <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
            <Clock size={14} className="text-orange-500" /> Engine Status
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-lg font-black text-rose-600 tracking-tighter">
                23
              </p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Queries
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-lg font-black text-orange-500 tracking-tighter">
                98%
              </p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Score
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
