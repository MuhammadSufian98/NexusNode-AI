"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

const sidebarItems = [
  { key: "dashboard", icon: Home, label: "Dashboard" },
  { key: "documents", icon: FileText, label: "Documents" },
  { key: "chat", icon: MessageSquare, label: "Chat" },
  { key: "settings", icon: Settings, label: "Settings" },
];

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

  const smoothSpring = {
    type: "spring",
    stiffness: 280,
    damping: 30,
    mass: 0.8,
  };

  return (
    <>
      {/* DESKTOP FLOATING SIDEBAR */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 p-4 select-none pointer-events-none">
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 250 : 78 }}
          transition={smoothSpring}
          className="h-full bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm pointer-events-auto relative py-6"
        >
          {/* TOP SECTION: LOGO + TOGGLE BUTTON */}
          <div className="px-3 shrink-0">
            <div className="relative flex items-center h-12 w-full">
              <div className="flex items-center gap-3 overflow-hidden pl-1">
                {/* Brand Icon with 3-color smooth gradient */}
                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-tr from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-2xl">
                  <Image
                    src="/favicon/logo.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="object-contain p-0.5"
                    priority
                  />
                </div>

                {/* Brand Name Text */}
                <AnimatePresence initial={false}>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">
                        NexusNode
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500">
                          AI
                        </span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                        Intelligence Hub
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: NAVIGATION ITEMS */}
          <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-hidden justify-center">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`group relative w-full h-11 rounded-xl flex items-center outline-none transition-colors cursor-pointer ${
                    active
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {/* Active Indicator Backdrop with smooth 3-color gradient blend */}
                  {active && (
                    <motion.div
                      layoutId="desktopActiveIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-rose-50 via-orange-50/70 to-amber-50/40 border border-rose-200/80 rounded-xl"
                      transition={smoothSpring}
                    />
                  )}

                  {/* Button Content with Fixed Icon Box for Strict Alignment */}
                  <div className="relative z-10 w-full flex items-center">
                    <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                      <Icon
                        size={18}
                        className={`transition-transform duration-200 ${
                          active
                            ? "text-rose-600 scale-110"
                            : "text-slate-500 group-hover:text-slate-800 group-hover:scale-105"
                        }`}
                        strokeWidth={active ? 2.3 : 1.8}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.16 }}
                          className={`text-xs tracking-tight whitespace-nowrap overflow-hidden pr-2 ${
                            active
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-600 group-hover:text-slate-900"
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* BOTTOM SECTION: SIGN OUT */}
          <div className="px-3 shrink-0 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate("signout")}
              className="group relative w-full h-11 rounded-xl flex items-center outline-none text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer"
            >
              <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                <LogOut
                  size={18}
                  className="text-slate-400 group-hover:text-rose-600 transition-colors"
                />
              </div>

              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    className="text-xs font-bold tracking-tight whitespace-nowrap overflow-hidden pr-2"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>
      </div>

      {/* MOBILE FLOATING BAR */}
      <motion.div
        animate={{ y: isMobileMinimized ? "calc(100% - 10px)" : 0 }}
        transition={smoothSpring}
        className="lg:hidden fixed bottom-4 inset-x-4 h-16 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl flex items-center z-50 overflow-visible"
      >
        <div className="flex items-center justify-around w-full h-full px-4 relative">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleMobileNavigate(item.key)}
                className={`relative p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  active
                    ? "text-rose-600"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-rose-50 via-orange-50/70 to-amber-50/40 border border-rose-200/80 rounded-xl -z-10"
                    transition={smoothSpring}
                  />
                )}
                <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
              </button>
            );
          })}

          <button
            onClick={() => handleMobileNavigate("signout")}
            className="relative p-2.5 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut size={19} />
          </button>

          {/* Minimize / Expand Toggle Chip */}
          <button
            onClick={() => setIsMobileMinimized(!isMobileMinimized)}
            className="absolute -top-3 right-5 p-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 border border-rose-400 rounded-full text-white translate-y-[-50%] transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
            title={isMobileMinimized ? "Expand Menu" : "Minimize Menu"}
          >
            <motion.div
              animate={{ rotate: isMobileMinimized ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center"
            >
              <ChevronUp size={12} />
            </motion.div>
          </button>
        </div>
      </motion.div>
    </>
  );
}
