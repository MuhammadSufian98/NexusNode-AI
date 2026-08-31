"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  FileText,
  User,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Toaster } from "react-hot-toast";
import { useUiStore, useDocumentStore, useOverviewStore, useAuth } from "@/store";

import Sidebar from "@/component/dashboard/Sidebar";
import {
  OverviewView,
  DocumentsView,
  ChatView,
  SettingsView,
  ProfileView,
} from "@/components/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } =
    useUiStore();
  const {
    isUploading,
    setIsUploading,
    documents,
    selectedDocument,
    setSelectedDocument,
    fetchDocuments,
  } = useDocumentStore();
  const overviewData = useOverviewStore((state) => state.overviewData);

  const { user, logout, hydrateSession, isAuthenticated, authChecked } =
    useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated, fetchDocuments]);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authChecked, isAuthenticated, router]);

  // Upload progress tracking effect
  useEffect(() => {
    let interval;
    if (isUploading) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsUploading(false), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isUploading, setIsUploading]);

  const handleSignOut = async () => {
    await logout();
    router.push("/auth");
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "Dashboard Overview";
      case "documents":
        return "Documents";
      case "chat":
        return "Assistant Chat";
      case "profile":
        return "User Profile";
      case "settings":
        return "Settings";
      default:
        return "Workspace";
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-slate-50 via-rose-50/20 to-orange-50/30 flex font-sans text-slate-900 selection:bg-rose-100 overflow-hidden relative">
      <Toaster position="top-right" />

      <Sidebar
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={(key) => setActiveSection(key)}
      />

      <main
        className={`flex-1 h-dvh min-h-0 flex flex-col w-full transition-[padding-left] duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-[266px]" : "lg:pl-[94px]"
        } p-2 md:p-3 lg:p-4 pb-24 md:pb-3 lg:pb-4`}
      >
        {/* TOP APP HEADER */}
        <header className="h-14 md:h-16 bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl md:rounded-3xl flex items-center justify-between px-4 md:px-6 mb-3 shrink-0 relative z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspace / {activeSection}
              </span>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                {getSectionTitle()}
              </h1>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="hidden lg:flex items-center max-w-xs w-full mx-4">
            <div className="relative w-full group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:bg-white rounded-xl py-1.5 pl-8.5 pr-3 text-xs font-medium transition-colors outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* HEADER RIGHT ACTIONS */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* System Status Pill */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Online
              </span>
            </div>

            {/* Notifications */}
            <button className="hidden xs:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer border border-transparent hover:border-slate-200">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" />
            </button>

            {/* User Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 md:pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-rose-600 relative overflow-hidden shrink-0">
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
                <ChevronDown
                  size={13}
                  className={`hidden md:block text-slate-400 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl p-1.5 z-50"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Signed In
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.email || "user@nexus.io"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSection("profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Profile Details</span>
                    </button>

                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto lg:overflow-hidden relative">
          <AnimatePresence mode="wait">
            {(activeSection === "dashboard" || activeSection === "overview") && (
              <OverviewView key="overview" />
            )}
            {activeSection === "documents" && (
              <DocumentsView
                key="documents"
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            )}
            {activeSection === "profile" && <ProfileView key="profile" />}
            {activeSection === "chat" && <ChatView key="chat" />}
            {activeSection === "settings" && <SettingsView key="settings" />}
          </AnimatePresence>
        </div>
      </main>

      {/* BOTTOM-RIGHT CORNER UPLOAD TOAST / PROCESS BOX */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 bg-white border border-slate-200/90 rounded-2xl p-3.5 w-72 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                  {uploadProgress === 100 ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <Loader2 size={15} className="animate-spin text-rose-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {uploadProgress === 100
                      ? "Indexed Successfully"
                      : "Uploading Document"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {uploadProgress}% processed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploading(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            {/* 3-Color Seamless Gradient Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-full"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
