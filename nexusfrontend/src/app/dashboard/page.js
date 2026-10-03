"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Loader2,
  CheckCircle2,
  Plus,
  Settings,
  ShieldCheck,
  FileText,
} from "lucide-react";

import { Toaster } from "react-hot-toast";
import {
  useUiStore,
  useDocumentStore,
  useOverviewStore,
  useAuth,
} from "@/store";

import Sidebar, { smoothLayoutTransition } from "@/component/dashboard/Sidebar";
import {
  OverviewView,
  DocumentsView,
  ChatView,
  SettingsView,
  ProfileView,
} from "@/component/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } =
    useUiStore();
  const { isUploading, setIsUploading, fetchDocuments, handleFileUpload } =
    useDocumentStore();
  const fetchOverviewData = useOverviewStore(
    (state) => state.fetchOverviewData,
  );

  const { user, logout, hydrateSession, isAuthenticated, authChecked } =
    useAuth();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const menuRef = useRef(null);
  const globalFileInputRef = useRef(null);

  // Sync viewport for layout padding coordination
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hydrate session & fetch initial docs
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated, fetchDocuments]);

  // Auth routing guard
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authChecked, isAuthenticated, router]);

  // Upload progress tracking
  useEffect(() => {
    let interval;
    if (isUploading) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsUploading(false), 600);
            return 100;
          }
          return prev + 12;
        });
      }, 140);
    }
    return () => clearInterval(interval);
  }, [isUploading, setIsUploading]);

  const handleGlobalUpload = async (e) => {
    const res = await handleFileUpload(e);
    if (res && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/auth");
  };

  // Clean, human-friendly titles
  const sectionMeta = useMemo(() => {
    switch (activeSection) {
      case "dashboard":
      case "overview":
        return {
          title: "Dashboard",
          subtitle: "Welcome back to your workspace overview",
        };
      case "documents":
        return {
          title: "Documents",
          subtitle: "Manage, view, and organize your uploaded files",
        };
      case "chat":
        return {
          title: "AI Chat",
          subtitle: "Ask questions and research across your documents",
        };
      case "profile":
        return {
          title: "Profile",
          subtitle: "Manage your personal account and preferences",
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "API keys, storage controls, and system preferences",
        };
      default:
        return {
          title: "Workspace",
          subtitle: "NexusNode Document Assistant",
        };
    }
  }, [activeSection]);

  return (
    <div className="h-dvh w-screen bg-[#F8F9FA] flex font-sans text-slate-900 selection:bg-rose-100 overflow-hidden relative">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-xs font-semibold text-slate-800 bg-white border border-slate-200/90 shadow-none rounded-xl",
        }}
      />

      {/* Global Hidden File Input */}
      <input
        ref={globalFileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleGlobalUpload}
      />

      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={(key) => setActiveSection(key)}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <motion.main
        initial={false}
        animate={{
          paddingLeft: isDesktop ? (sidebarOpen ? 284 : 96) : 0,
        }}
        transition={smoothLayoutTransition}
        style={{ willChange: "padding-left" }}
        className="flex-1 h-dvh min-h-0 flex flex-col w-full z-10 p-2.5 sm:p-3.5 lg:p-4 pb-20 lg:pb-4"
      >
        {/* ========================================================= */}
        {/* CLEAN TOP HEADER (NO SEARCH BAR, HUMAN TITLES)            */}
        {/* ========================================================= */}
        <header className="h-16 bg-[#F8F9FA] border border-slate-200/70 rounded-2xl md:rounded-3xl flex items-center justify-between px-4 sm:px-6 mb-3 shrink-0 shadow-none">
          {/* Left: Section Title & Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer active:scale-[0.98]"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </button>

            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                {sectionMeta.title}
              </h1>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                {sectionMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick Action & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Upload Button */}
            <button
              type="button"
              onClick={() => globalFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-95 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-transform duration-100 ease-out cursor-pointer shadow-none"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Upload Document</span>
              <span className="xs:hidden">Upload</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
              aria-label="View notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* User Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-rose-600 relative overflow-hidden shrink-0">
                  {user?.avatarUrl || user?.avatar ? (
                    <Image
                      src={user.avatarUrl || user.avatar}
                      alt="User avatar"
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User size={15} />
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left pr-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight max-w-[110px] truncate">
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Online
                  </span>
                </div>

                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Panel */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl p-1.5 z-50 shadow-none"
                  >
                    <div className="px-3 py-2.5 mb-1 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Signed In As
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {user?.email || "user@nexusnode.ai"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-left"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Account Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("settings");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-left"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>App Settings</span>
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await handleSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN VIEWPORT STAGE CANVAS                                */}
        {/* ========================================================= */}
        <section className="flex-1 min-h-0 w-full rounded-2xl md:rounded-3xl border border-slate-200/70 bg-[#F8F9FA] overflow-hidden relative flex flex-col shadow-none">
          <div
            className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain relative custom-scrollbar"
            data-lenis-prevent
          >
            <AnimatePresence mode="wait">
              {(activeSection === "dashboard" ||
                activeSection === "overview") && (
                <OverviewView key="overview" />
              )}
              {activeSection === "documents" && (
                <DocumentsView
                  key="documents"
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              )}
              {activeSection === "chat" && <ChatView key="chat" />}
              {activeSection === "profile" && <ProfileView key="profile" />}
              {activeSection === "settings" && <SettingsView key="settings" />}
            </AnimatePresence>
          </div>
        </section>
      </motion.main>

      {/* ========================================================= */}
      {/* CORNER UPLOADING STATUS CARD                              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200/90 rounded-2xl p-4 w-80 shadow-none"
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                  {uploadProgress === 100 ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <Loader2 size={16} className="animate-spin text-rose-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {uploadProgress === 100
                      ? "Document Ready"
                      : "Processing Document"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {uploadProgress < 100
                      ? `Uploading and preparing (${uploadProgress}%)`
                      : "Complete and ready for chat"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-full"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 font-mono text-[9px] text-slate-400">
              <span>PDF Ingestion</span>
              <span>{uploadProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
