"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Home, FileText, MessageSquare, Settings, LogOut, User } from "lucide-react";

const sidebarItems = [
  { key: "dashboard", icon: Home, label: "Dashboard" },
  { key: "documents", icon: FileText, label: "Documents" },
  { key: "chat", icon: MessageSquare, label: "Chat" },
  { key: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ activeSection, sidebarOpen, setSidebarOpen, onNavigate }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncViewport);
    } else {
      mediaQuery.addListener(syncViewport);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncViewport);
      } else {
        mediaQuery.removeListener(syncViewport);
      }
    };
  }, []);

  const isRail = isDesktop && !sidebarOpen;
  const sidebarWidth = isDesktop ? (sidebarOpen ? 256 : 100) : sidebarOpen ? 288 : 0;
  const transition = { type: "spring", stiffness: 220, damping: 28, mass: 0.8 };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: isDesktop ? 0 : sidebarOpen ? 0 : -320,
        }}
        transition={transition}
        className="fixed left-0 top-0 z-50 h-screen p-3 md:p-4 select-none pointer-events-none"
      >
        <motion.div
          layout
          transition={transition}
          className="h-full bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        >
          <Link href="/" className="flex items-center h-20 px-5 shrink-0">
            <motion.div layout className="flex items-center gap-3 px-2">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                              src="/favicon/logo.png"
                              alt="NexusNode AI Logo"
                              fill
                              sizes="40px"
                              className="object-contain"
                              priority
                            />
              </div>
              <AnimatePresence mode="popLayout">
                {!isRail && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-black tracking-tighter whitespace-nowrap"
                  >
                    NexusNode<span className="text-rose-600">AI</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <nav className="flex-1 px-3 space-y-2 mt-2">
            {sidebarItems.map((item) => {
              const active = activeSection === item.key;
              return (
                <motion.button
                  key={item.key}
                  layout
                  transition={transition}
                  onClick={() => onNavigate(item.key)}
                  className={`relative flex items-center h-12 w-full overflow-hidden transition-colors group ${
                    active
                      ? "text-rose-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                  style={{ borderRadius: "1.25rem" }}
                >
                  {active && (
                    <motion.div
                      layoutId="activePill"
                      transition={transition}
                      className="absolute inset-0 bg-rose-50 border border-rose-100"
                      style={{
                        borderRadius: isRail ? "999px" : "1rem",
                        width: isRail ? "48px" : "100%",
                        height: "48px",
                        margin: isRail ? "0 auto" : "0",
                      }}
                    />
                  )}

                  <motion.div
                    layout
                    className={`relative z-10 flex items-center h-full w-full ${isRail ? "justify-center" : "px-4 gap-4"}`}
                  >
                    <motion.div layout className="shrink-0">
                      <item.icon
                        size={isRail ? 22 : 20}
                        strokeWidth={active ? 2.5 : 2}
                      />
                    </motion.div>

                    <AnimatePresence>
                      {!isRail && (
                        <motion.span
                          layout
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          className="font-bold text-sm whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-auto p-3 space-y-2 border-t border-slate-50">
            <motion.button
              layout
              onClick={() => onNavigate("settings")}
              className={`flex items-center h-12 w-full rounded-2xl hover:bg-slate-50 text-slate-600 transition-all ${
                isRail ? "justify-center" : "px-3 gap-3"
              }`}
            >
              <motion.div
                layout
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"
              >
                <User size={16} />
              </motion.div>
              {!isRail && (
                <motion.span
                  layout
                  className="font-bold text-sm whitespace-nowrap"
                >
                  Profile
                </motion.span>
              )}
            </motion.button>

            <motion.button
              layout
              className={`flex items-center h-12 w-full rounded-2xl hover:bg-rose-50 text-rose-600 transition-all ${
                isRail ? "justify-center" : "px-3 gap-3"
              }`}
            >
              <motion.div
                layout
                className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0"
              >
                <LogOut size={16} />
              </motion.div>
              {!isRail && (
                <motion.span
                  layout
                  className="font-bold text-sm whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
