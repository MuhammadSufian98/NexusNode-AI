"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  FileText,
  User,
  LogOut,
} from "lucide-react";

import { Toaster } from "react-hot-toast";
import { useGlobal } from "@/store/globalStore";
import { useAuth } from "@/store/authStore";

import Sidebar from "@/component/dashboard/Sidebar";
import NexusChatInterface from "@/component/dashboard/NexusChat";
import SettingsView from "@/component/dashboard/Setting";
import OverviewView from "@/component/dashboard/overView";
import DocumentsView from "@/component/dashboard/document";
import Profile from "@/component/dashboard/profile";

export default function Dashboard() {
  const router = useRouter();
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
    overviewData,
  } = useGlobal();

  const { user, logout, hydrateSession, isAuthenticated, authChecked } =
    useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authChecked, isAuthenticated, router]);

  const handleSignOut = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <div className="h-dvh bg-slate-50 flex font-sans text-slate-900 selection:bg-rose-100 overflow-hidden">
      <Toaster position="top-right" />

      {/* NEW MODULAR SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={(key) => setActiveSection(key)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 h-dvh min-h-0 flex flex-col w-full transition-[padding-left] duration-300 ease-out ${
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-[100px]"
        } p-2 md:p-3 lg:p-4`}
      >
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl md:rounded-4xl flex items-center justify-between px-4 md:px-8 mb-3 md:mb-4 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 md:p-2.5 bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-600 rounded-xl transition-all shadow-sm"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex flex-col">
              <span className="xs:block text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                System / {activeSection}
              </span>
              <h1 className="text-lg xl:text-xl font-black tracking-tight text-slate-900">
                Intelligence <span className="text-rose-600">Center</span>
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center max-w-xs w-full mx-4">
            <div className="relative w-full group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full bg-slate-100/50 border border-transparent focus:bg-white focus:border-rose-200 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 border border-slate-100 px-2 md:px-3 py-1.5 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[9px] font-black text-slate-900 uppercase">
                  Live
                </span>
                <span className="text-[8px] font-bold text-slate-400">
                  {overviewData.engineVersion || "v4.2"}
                </span>
              </div>
            </div>

            <button className="hidden xs:flex p-2 md:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 border border-white rounded-full" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 md:pr-3 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-linear-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <ChevronDown
                  size={12}
                  className={`hidden md:block text-slate-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 md:w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl p-2 z-50"
                  >
                    <div className="px-4 py-3 mb-1 border-b border-slate-50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">
                        Operator
                      </p>
                      <p className="text-xs font-black text-slate-900 truncate">
                        {user?.email || "Unknown"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection("profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                    >
                      <User size={14} className="text-slate-400" /> Profile
                    </button>
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-600 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 w-full overflow-y-auto lg:overflow-hidden">
          {activeSection === "dashboard" && <OverviewView />}
          {activeSection === "documents" && <DocumentsView />}
          {activeSection === "profile" && <Profile />}
          {activeSection === "chat" && (
            <NexusChatInterface
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              documents={documents}
            />
          )}
          {activeSection === "settings" && <SettingsView />}
        </div>
      </main>

      {/* Shared Upload Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 md:p-12 rounded-[3rem] text-center shadow-3xl border border-slate-100 max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-rose-600 animate-pulse" size={28} />
              </div>
              <p className="font-black">Indexing Knowledge...</p>
              <button
                onClick={() => setIsUploading(false)}
                className="mt-6 text-[10px] font-black text-slate-300 hover:text-rose-600 uppercase"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
