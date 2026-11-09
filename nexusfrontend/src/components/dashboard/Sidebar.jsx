"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  MessageSquareCode,
  Settings2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

const sidebarItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
  { key: "documents", icon: FileText, label: "Documents", badge: "12" },
  { key: "chat", icon: MessageSquareCode, label: "Chat Studio", badge: "Live" },
  { key: "settings", icon: Settings2, label: "Settings", badge: null },
];

export const smoothLayoutTransition = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1], // Cubic bezier: instant start, feather deceleration
};

export default function Sidebar({
  activeSection,
  sidebarOpen,
  setSidebarOpen,
  onNavigate,
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileMinimized, setIsMobileMinimized] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const handleMobileNavigate = (key) => {
    onNavigate(key);
    setIsMobileMinimized(true);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP FLOATING ARCHITECTURAL SIDEBAR                   */}
      {/* ========================================================= */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 p-3.5 select-none pointer-events-none">
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 76 }}
          transition={smoothLayoutTransition}
          style={{ willChange: "width" }}
          className="relative h-full bg-[#F8F9FA] border border-slate-200/70 rounded-3xl flex flex-col justify-between shadow-none pointer-events-auto py-5 px-3 overflow-visible"
        >
          {/* Collapse / Expand Edge Micro-Toggle Button */}
          {setSidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3.5 top-9 z-50 w-7 h-7 bg-white border border-slate-200/90 rounded-full shadow-2xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors focus:outline-none cursor-pointer active:scale-[0.98]"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center"
              >
                <ChevronLeft size={14} strokeWidth={2.2} />
              </motion.div>
            </button>
          )}

          {/* TOP SECTION: BRAND IDENTITY */}
          <div className="shrink-0">
            <div className="relative flex items-center h-12 w-full px-1">
              <div className="flex items-center gap-3 w-full">
                {/* Brand Logo Shield */}
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-2xl shadow-none">
                  <Image
                    src="/favicon/logo.png"
                    alt="NexusNode"
                    width={22}
                    height={22}
                    className="object-contain"
                    priority
                  />
                  {/* Status Indicator Pip */}
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                {/* Brand Title & System Metatag */}
                <AnimatePresence initial={false}>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
                      className="whitespace-nowrap overflow-hidden flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-extrabold tracking-tight text-slate-900 leading-none">
                          NexusNode
                        </span>
                        <span className="text-[14px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 leading-none">
                          AI
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                          v2.4 • In-Memory
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="mt-4 px-1">
              <div className="h-px bg-slate-200/70" />
            </div>
          </div>

          {/* MIDDLE SECTION: MAIN NAVIGATION */}
          <nav className="flex-1 mt-4 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`group relative w-full h-11 rounded-2xl flex items-center transition-all duration-150 outline-none cursor-pointer active:scale-[0.98] ${
                    active
                      ? "text-slate-900 font-semibold bg-gradient-to-r from-rose-50/90 via-orange-50/60 to-transparent border border-rose-200/70"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent font-medium"
                  }`}
                >
                  {/* Icon Frame */}
                  <div className="relative z-10 w-[50px] h-11 shrink-0 flex items-center justify-center">
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.3 : 1.8}
                      className={`transition-transform duration-150 ${
                        active
                          ? "text-rose-600 scale-105"
                          : "text-slate-500 group-hover:text-slate-800 group-hover:scale-105"
                      }`}
                    />
                  </div>

                  {/* Navigation Label & Metric Badges */}
                  <AnimatePresence initial={false}>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="relative z-10 flex-1 flex items-center justify-between pr-3 whitespace-nowrap overflow-hidden text-left"
                      >
                        <span className="text-[13px] tracking-tight truncate">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                              active
                                ? "bg-rose-100/80 text-rose-700"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>

          {/* BOTTOM SECTION: PROFILE / SIGN OUT */}
          <div className="shrink-0 pt-3 border-t border-slate-200/60 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onNavigate("signout")}
              className="group relative w-full h-11 rounded-2xl flex items-center outline-none text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-all duration-150 cursor-pointer active:scale-[0.98]"
            >
              <div className="w-[50px] h-11 shrink-0 flex items-center justify-center">
                <LogOut
                  size={18}
                  strokeWidth={1.8}
                  className="text-slate-400 group-hover:text-rose-600 group-hover:-translate-x-0.5 transition-all duration-150"
                />
              </div>

              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden pr-3"
                  >
                    <span className="text-[13px] font-semibold tracking-tight">
                      End Session
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE FLOATING DOCK                                     */}
      {/* ========================================================= */}
      <motion.div
        animate={{ y: isMobileMinimized ? "calc(100% - 14px)" : 0 }}
        transition={smoothLayoutTransition}
        className="lg:hidden fixed bottom-4 inset-x-3.5 z-50 overflow-visible"
      >
        <div className="relative bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs">
          {/* Minimize / Expand Indicator Handle */}
          <button
            type="button"
            onClick={() => setIsMobileMinimized(!isMobileMinimized)}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-slate-200/90 rounded-full shadow-2xs text-slate-500 hover:text-slate-800 transition-transform active:scale-[0.98] flex items-center justify-center cursor-pointer"
            aria-label={isMobileMinimized ? "Expand Menu" : "Minimize Menu"}
          >
            <motion.div
              animate={{ rotate: isMobileMinimized ? 180 : 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChevronUp size={11} strokeWidth={2.5} />
            </motion.div>
          </button>

          <div className="flex items-center justify-between w-full h-12 px-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleMobileNavigate(item.key)}
                  className={`relative flex-1 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98] ${
                    active
                      ? "text-rose-600 bg-gradient-to-r from-rose-50 via-orange-50/70 to-amber-50/40 border border-rose-200/80"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.3 : 1.8}
                    className="relative z-10"
                  />
                </button>
              );
            })}

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => handleMobileNavigate("signout")}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
