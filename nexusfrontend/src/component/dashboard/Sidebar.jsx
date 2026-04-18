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
  User,
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const isRail = isDesktop && !sidebarOpen;
  const sidebarWidth = isDesktop
    ? sidebarOpen
      ? 260
      : 110
    : sidebarOpen
      ? 280
      : 0;
  const transition = { type: "spring", stiffness: 300, damping: 35, mass: 0.8 };

  return (
    <>
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: isDesktop ? 0 : sidebarOpen ? 0 : -300,
        }}
        transition={transition}
        className="fixed left-0 top-0 z-50 h-screen p-3 md:p-4 select-none pointer-events-none"
      >
        <motion.div
          layout
          className="h-full bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        >
          {/* LOGO SECTION - LOCKED TRACK */}
          <Link
            href="/"
            className="relative flex items-center h-24 shrink-0 overflow-hidden"
          >
            <div className={`absolute left-0 w-20 flex items-center justify-center`}>
              <div className="relative w-10 h-10">
                <Image
                  src="/favicon/logo.png"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                  className="ml-24 text-lg font-black tracking-tighter whitespace-nowrap text-slate-900"
                >
                  NexusNode<span className="text-rose-600">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* NAVIGATION - LOCKED TRACK */}
          <nav className="flex-1 px-3 space-y-3 mt-2">
            {sidebarItems.map((item) => {
              const active = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`relative flex items-center h-14 w-full transition-colors group rounded-full overflow-hidden ${
                    active
                      ? "text-rose-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-rose-50 border border-rose-100 rounded-full"
                        transition={transition}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 w-full h-full flex items-center">
                    {/* THIS IS THE FIX: A fixed absolute track for the icon */}
                    <div className="absolute left-0 w-14 flex items-center justify-center">
                      <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                    </div>

                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -5,
                            transition: { duration: 0.1 },
                          }}
                          className="ml-20 font-bold text-sm whitespace-nowrap"
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

          {/* FOOTER - LOCKED TRACK */}
          <div className="mt-auto p-3 space-y-3 border-t border-slate-50">
            {[
              { key: "profile", icon: User, label: "Profile", color: "slate" },
              {
                key: "signout",
                icon: LogOut,
                label: "Sign Out",
                color: "rose",
              },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => btn.key === "profile" && onNavigate("profile")}
                className={`relative flex items-center h-14 w-full rounded-full transition-all ${
                  btn.color === "rose"
                    ? "hover:bg-rose-50 text-rose-600"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="relative z-10 w-full h-full flex items-center">
                  <div className="absolute left-0 w-14 flex items-center justify-center">
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-xl ${btn.color === "rose" ? "bg-rose-100" : "bg-slate-100"}`}
                    >
                      <btn.icon size={18} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        className="ml-20 font-bold text-sm whitespace-nowrap"
                      >
                        {btn.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
