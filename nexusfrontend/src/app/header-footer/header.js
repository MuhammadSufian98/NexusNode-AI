"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronRight,
  Globe,
  Zap,
  Shield,
  LayoutDashboard,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/store/authStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      // Morph to floating pill when scrolling past top threshold
      setIsScrolled(currentScrollY > 20);

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (scrollDifference > 6) {
        setIsVisible(false); // Scrolling down
      } else if (scrollDifference < -6) {
        setIsVisible(true); // Scrolling up
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
  }, [mobileMenuOpen]);

  const navItems = [
    {
      name: "How it works",
      link: "#pipeline-overview",
      icon: <Zap size={14} />,
    },
    { name: "Architecture", link: "#architecture", icon: <Globe size={14} /> },
    { name: "Security", link: "#security", icon: <Shield size={14} /> },
  ];

  const AuthButton = ({ mobile = false }) => (
    <Link
      href={user ? "/dashboard" : "/auth/login"}
      className={mobile ? "w-full" : "shrink-0"}
    >
      <button
        className={`${
          mobile
            ? "w-full py-3.5 rounded-xl text-sm"
            : isScrolled
              ? "text-[11px] px-4 py-1.5 rounded-full"
              : "text-[12px] px-5 py-2 rounded-full"
        } font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:opacity-95 active:scale-95 text-white shadow-md shadow-rose-950/20 transition-all cursor-pointer border border-rose-400/30`}
      >
        {user ? (
          <>
            {mobile && <LayoutDashboard size={16} />}
            <span>Workspace</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </>
        ) : (
          <>
            <span>Launch App</span>
            <LogIn size={13} strokeWidth={2.5} />
          </>
        )}
      </button>
    </Link>
  );

  return (
    <>
      <motion.div
        animate={{
          y: isVisible ? 0 : -110,
        }}
        transition={{
          duration: 0.32,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center transition-[padding] duration-300 ${
          isScrolled ? "px-4 sm:px-6 pt-3" : "px-0 pt-0"
        }`}
      >
        <motion.header
          layout
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto transition-all duration-300 ${
            isScrolled
              ? "w-full max-w-5xl px-4 sm:px-6 py-2 rounded-full border border-slate-200/80 bg-[#FAF9F6]/90 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              : "w-full px-6 sm:px-8 py-4 rounded-none border-b border-slate-200/60 bg-[#FAF9F6]/80 backdrop-blur-md"
          }`}
        >
          {/* INNER CONTENT CONTAINER PINNED TO MAX 1200PX */}
          <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
            {/* BRAND IDENTITY */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className={`relative transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? "w-7 h-7" : "w-8 h-8"
                }`}
              >
                <Image
                  src="/favicon/logo.png"
                  alt="NexusNode AI Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-black tracking-tight text-slate-900 transition-all duration-300 ${
                    isScrolled ? "text-sm sm:text-base" : "text-base sm:text-lg"
                  }`}
                >
                  NexusNode
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500 ml-0.5">
                    AI
                  </span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-rose-200/70 bg-rose-50 text-rose-600 font-bold">
                  <Sparkles size={9} /> v4.2
                </span>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION DOCK */}
            <nav className="hidden md:flex items-center gap-3">
              <div
                className={`flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 shadow-xs backdrop-blur-md transition-all duration-300 ${
                  isScrolled ? "p-1" : "p-1.5"
                }`}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    className={`flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-all ${
                      isScrolled
                        ? "px-3.5 py-1 text-xs"
                        : "px-4 py-1.5 text-[13px]"
                    }`}
                  >
                    <span className="text-slate-400 group-hover:text-rose-500 transition-colors">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="h-4 w-[1px] bg-slate-200 mx-1" />

              <AuthButton />
            </nav>

            {/* MOBILE TOGGLE BAR */}
            <div className="flex md:hidden items-center">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs active:scale-95 transition-transform cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </motion.header>
      </motion.div>

      {/* MOBILE FULL-SCREEN DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-60 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[84%] max-w-xs bg-[#FAF9F6] z-70 shadow-2xl md:hidden flex flex-col border-l border-slate-200 p-5 justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Navigation
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 font-bold">
                      PRO
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 bg-white text-slate-500 rounded-full border border-slate-200 hover:text-slate-900 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-rose-500 shadow-2xs">
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <AuthButton mobile />
                <p className="text-center text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  NexusNode AI • Document Intelligence
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
