"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Upload,
  Trash2,
  Send,
  Bot,
  User,
  Menu,
  X,
  Clock,
  Folder,
  ChevronRight,
  Zap,
  Database,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import NexusChatInterface from "@/component/dashboard/NexusChat";
import SettingsView from "@/component/dashboard/Setting";
import OverviewView from "@/component/dashboard/overView";
import DocumentsView from "@/component/dashboard/document";

const sidebarItems = [
  { key: "dashboard", icon: Home, label: "Dashboard", path: "/" },
  {
    key: "documents",
    icon: FileText,
    label: "Documents",
    path: "/dashboard/documents",
  },
  { key: "chat", icon: MessageSquare, label: "Chat", path: "/dashboard/chat" },
  {
    key: "settings",
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings",
  },
];

const mockDocuments = [
  {
    id: "1",
    name: "annual-report-2024.pdf",
    pages: 24,
    size: "2.4 MB",
    status: "ready",
  },
  {
    id: "2",
    name: "research-paper-ai.pdf",
    pages: 42,
    size: "5.1 MB",
    status: "ready",
  },
  {
    id: "3",
    name: "meeting-notes-q4.pdf",
    pages: 12,
    size: "890 KB",
    status: "ready",
  },
];

export default function Dashboard() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on your analysis, the data indicates a steady progression in the primary metrics.`,
        sources: [{ page: 12 }],
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsProcessing(false);
      toast.success("Insight retrieved!");
    }, 1500);
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: Date.now().toString(),
        name: `new-analysis.pdf`,
        pages: 15,
        size: "1.2 MB",
        status: "ready",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      toast.success("Document indexed!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-rose-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="w-72 h-screen fixed left-0 top-0 z-40 p-4"
          >
            <div className="h-full bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col p-6">
              <Link href="/" className="flex items-center gap-3 mb-10 group">
                <div className="relative w-10 h-10 group-hover:rotate-12 transition-transform duration-500">
                  <Image
                    src="/favicon/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-black tracking-tighter">
                  NexusNode<span className="text-rose-600">AI</span>
                </span>
              </Link>

              <nav className="flex-1 space-y-2">
                {sidebarItems.map((item, i) => (
                  <button
                    key={item.key}
                    onClick={() => setSection(item.key)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                      section === item.key
                        ? "bg-rose-50 text-rose-600 border border-rose-100 shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <button
                  onClick={handleFileUpload}
                  className="w-full py-4 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:scale-[1.02] transition-transform"
                >
                  <Upload size={16} /> Upload PDF
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-72" : "ml-0"} p-4`}
      >
        <header className="h-20 bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl flex items-center justify-between px-8 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-black tracking-tight">
              Intelligence Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black text-rose-600 uppercase">
                Neural Engine Active
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <User size={20} className="text-slate-600" />
            </div>
          </div>
        </header>

        {section === "dashboard" && <OverviewView />}

        {section === "documents" && <DocumentsView />}

        {section === "chat" && (
          <NexusChatInterface
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            documents={documents}
          />
        )}
        {section === "settings" && <SettingsView />}
      </main>

      {/* Upload Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 md:p-12 rounded-[3rem] text-center shadow-3xl border border-slate-100 max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-4xl flex items-center justify-center mx-auto mb-6">
                <Upload className="text-rose-600 animate-bounce" size={32} />
              </div>
              <p className="text-lg font-black tracking-tight">
                Indexing Knowledge...
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-[0.2em]">
                Neural Vector Mapping
              </p>

              {/* Simulate completion for UX testing */}
              <button
                onClick={() => setIsUploading(false)}
                className="mt-8 text-[9px] font-black uppercase text-slate-300 hover:text-rose-600 transition-colors"
              >
                Cancel Process
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
