"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
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

  const desktopTransition = {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 1,
  };
  const mobileTransition = { type: "spring", stiffness: 260, damping: 28 };

  return (
    <>
      {/* TRULY FLOATING DESKTOP SIDEBAR */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 p-4 select-none pointer-events-none">
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 240 : 76 }}
          transition={desktopTransition}
          className="h-full bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl shadow-slate-100 pointer-events-auto py-8"
        >
          {/* LOGO SECTION */}
          <div className="h-12 w-full mb-10 shrink-0 relative flex items-center">
            <motion.div
              animate={{
                x: sidebarOpen ? 24 : 18,
              }}
              transition={desktopTransition}
              className="flex items-center whitespace-nowrap absolute left-0"
            >
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                <Image
                  src="/favicon/logo.png"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <motion.span
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  x: sidebarOpen ? 0 : -10,
                }}
                transition={{ duration: 0.25 }}
                className="ml-4 text-base font-black tracking-tighter text-slate-900 pointer-events-none"
              >
                NexusNode<span className="text-rose-600">AI</span>
              </motion.span>
            </motion.div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 w-full px-3 flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`relative w-full h-12 rounded-2xl flex items-center group outline-none transition-colors ${
                    active
                      ? "text-rose-600"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="desktopActiveIndicator"
                      className="absolute inset-0 bg-rose-50 border border-rose-100 rounded-2xl"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 28,
                      }}
                    />
                  )}

                  <motion.div
                    animate={{
                      x: sidebarOpen ? 16 : 10,
                    }}
                    transition={desktopTransition}
                    className="flex items-center absolute left-0 whitespace-nowrap z-10"
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <Icon size={20} strokeWidth={active ? 2.2 : 2} />
                    </div>
                    <motion.span
                      animate={{
                        opacity: sidebarOpen ? 1 : 0,
                        x: sidebarOpen ? 0 : -10,
                      }}
                      transition={{ duration: 0.25 }}
                      className="ml-2 text-xs font-black tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                </button>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="mt-auto px-3 w-full">
            <button
              onClick={() => onNavigate("signout")}
              className="relative w-full h-12 rounded-2xl flex items-center group outline-none text-rose-600 hover:bg-rose-50/40 transition-colors"
            >
              <motion.div
                animate={{
                  x: sidebarOpen ? 16 : 10,
                }}
                transition={desktopTransition}
                className="flex items-center absolute left-0 whitespace-nowrap z-10"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <LogOut size={20} />
                </div>
                <motion.span
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    x: sidebarOpen ? 0 : -10,
                  }}
                  transition={{ duration: 0.25 }}
                  className="ml-2 text-xs font-black tracking-tight"
                >
                  Sign Out
                </motion.span>
              </motion.div>
            </button>
          </div>
        </motion.aside>
      </div>

      {/* MOBILE FLOATING BAR */}
      <motion.div
        animate={{ y: isMobileMinimized ? "calc(100% - 1px)" : 0 }}
        transition={mobileTransition}
        className="lg:hidden fixed bottom-4 inset-x-4 h-16 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl flex items-center z-50 overflow-visible"
      >
        <div className="flex items-center justify-around w-full h-full px-6 relative">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleMobileNavigate(item.key)}
                className={`relative p-3 rounded-2xl flex items-center justify-center transition-colors ${
                  active ? "text-rose-600" : "text-slate-400"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute inset-0 bg-rose-50 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon size={20} />
              </button>
            );
          })}

          <button
            onClick={() => handleMobileNavigate("signout")}
            className="relative p-3 rounded-2xl flex items-center justify-center text-slate-400"
          >
            <LogOut size={20} />
          </button>

          <button
            onClick={() => setIsMobileMinimized(!isMobileMinimized)}
            className="absolute -top-3 right-4 p-2.5 bg-rose-600 border border-rose-500 rounded-full text-white shadow-xl translate-y-[-100%] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: isMobileMinimized ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <ChevronUp size={14} />
            </motion.div>
          </button>
        </div>
      </motion.div>
    </>
  );
}
