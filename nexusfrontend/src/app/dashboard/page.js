"use client";

import React, { useRef, useEffect, useState } from "react";
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
  User,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Toaster } from "react-hot-toast";
import { useGlobal } from "@/context/globalContext";
import NexusChatInterface from "@/component/dashboard/NexusChat";
import SettingsView from "@/component/dashboard/Setting";
import OverviewView from "@/component/dashboard/overView";
import DocumentsView from "@/component/dashboard/document";

const sidebarItems = [
  { key: "dashboard", icon: Home, label: "Dashboard" },
  { key: "documents", icon: FileText, label: "Documents" },
  { key: "chat", icon: MessageSquare, label: "Chat" },
  { key: "settings", icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const {
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    isUploading,
    setIsUploading,
    documents,
    selectedDocument,
    setSelectedDocument,
    handleFileUpload,
    overviewData,
  } = useGlobal();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Profile", icon: User, color: "text-slate-600" },
    {
      label: "Settings",
      icon: Settings,
      color: "text-slate-600",
      action: () => setActiveSection("settings"),
    },
    {
      label: "Logout",
      icon: LogOut,
      color: "text-rose-600",
      action: () => console.log("Logout Logic"),
    },
  ];

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
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                      activeSection === item.key
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
                <label className="w-full py-4 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:scale-[1.02] transition-transform cursor-pointer">
                  <Upload size={16} /> Upload PDF
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf"
                  />
                </label>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-72" : "ml-0"} p-4`}
      >
        <header className="h-20 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] flex items-center justify-between px-6 xl:px-8 mb-6 shadow-sm sticky top-4 z-30">
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-600 rounded-xl transition-all shadow-sm group"
            >
              {sidebarOpen ? (
                <X size={18} />
              ) : (
                <Menu
                  size={18}
                  className="group-hover:rotate-90 transition-transform"
                />
              )}
            </button>

            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                System / {activeSection}
              </span>
              <h1 className="text-lg xl:text-xl font-black tracking-tight text-slate-900">
                Intelligence <span className="text-rose-600">Center</span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center max-w-xs w-full mx-4">
            <div className="relative w-full group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full bg-slate-100/50 border border-transparent focus:bg-white focus:border-rose-200 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-black text-slate-900 uppercase">
                  Live Index
                </span>
                <span className="text-[8px] font-bold text-slate-400">
                  {overviewData.engineVersion}
                </span>
              </div>
            </div>

            <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 bg-white border border-slate-200 hover:border-rose-200 rounded-2xl transition-all shadow-sm group"
              >
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                  <User size={18} />
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/50 p-3 overflow-hidden"
                  >
                    <div className="px-4 py-3 mb-2 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Active Operator
                      </p>
                      <p className="text-sm font-black text-slate-900 truncate">
                        nexus.admin@node.ai
                      </p>
                    </div>
                    <div className="space-y-1">
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.action?.();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <item.icon
                            size={16}
                            className={`${item.color} group-hover:scale-110 transition-transform`}
                          />
                          <span
                            className={`text-xs font-bold ${item.color.includes("rose") ? "text-rose-600" : "text-slate-700"}`}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {activeSection === "dashboard" && <OverviewView />}
        {activeSection === "documents" && <DocumentsView />}
        {activeSection === "chat" && (
          <NexusChatInterface
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            documents={documents}
          />
        )}
        {activeSection === "settings" && <SettingsView />}
      </main>

      {/* Upload Overlay Integrated with Global State */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 md:p-12 rounded-[3rem] text-center shadow-3xl border border-slate-100 max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Upload className="text-rose-600 animate-bounce" size={32} />
              </div>
              <p className="text-lg font-black tracking-tight">
                Indexing Knowledge...
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-[0.2em]">
                Neural Vector Mapping
              </p>
              <button
                onClick={() => setIsUploading(false)}
                className="mt-8 text-[9px] font-black uppercase text-slate-300 hover:text-rose-600 transition-colors"
              >
                Cancel Process
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
