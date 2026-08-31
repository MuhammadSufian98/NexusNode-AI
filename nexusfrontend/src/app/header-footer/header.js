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
import GlassButton from "@/component/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/store/authStore";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
  }, [mobileMenuOpen]);

  const navItems = [
    { name: "How it works", link: "#how-it-works", icon: <Zap size={15} /> },
    { name: "Features", link: "#features", icon: <Shield size={15} /> },
    { name: "Architecture", link: "#architecture", icon: <Globe size={15} /> },
  ];

  const AuthButton = ({ mobile = false }) => (
    <Link
      href={user ? "/dashboard" : "/auth/login"}
      className={mobile ? "w-full" : ""}
    >
      <GlassButton
        className={`${
          mobile
            ? "w-full py-3.5 rounded-full"
            : isScrolled
              ? "text-[11px] px-4 py-1.5 rounded-full"
              : "text-[12px] px-5 py-2 rounded-full"
        } font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-600 to-orange-500 border-none text-white shadow-md shadow-rose-500/20 dark:shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all`}
      >
        {user ? (
          <>
            {mobile && <LayoutDashboard size={18} />} Launch App
            <ChevronRight size={13} />
          </>
        ) : (
          <>
            Sign In
            <LogIn size={13} />
          </>
        )}
      </GlassButton>
    </Link>
  );

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-50 pointer-events-none transition-all duration-500 ease-out flex justify-center ${
          isScrolled ? "px-4 sm:px-6 pt-3" : "px-0 pt-0"
        }`}
      >
        <motion.header
          layout
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between transition-colors duration-300 ${
            isScrolled
              ? "w-full max-w-5xl px-5 sm:px-7 py-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-glass)] shadow-xl shadow-black/5 backdrop-blur-2xl"
              : "w-full max-w-none px-6 sm:px-12 lg:px-16 py-4 rounded-none border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-md"
          }`}
        >
          {/* LOGO & BRAND */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className={`relative transition-all duration-300 group-hover:scale-105 ${
                isScrolled ? "w-7 h-7" : "w-8 h-8 md:w-9 md:h-9"
              }`}
            >
              <Image
                src="/favicon/logo.png"
                alt="NexusNode AI Logo"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black tracking-tight text-[var(--text-primary)] transition-all duration-300 ${
                  isScrolled ? "text-sm md:text-base" : "text-base md:text-lg"
                }`}
              >
                NexusNode
                <span className="text-[var(--accent-primary)]">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-md border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-muted)] font-semibold">
                v2.4
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-3">
            <div
              className={`flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 transition-all duration-300 ${
                isScrolled ? "p-1" : "p-1.5"
              }`}
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className={`flex items-center gap-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-full hover:bg-[var(--bg-surface)] transition-all ${
                    isScrolled
                      ? "px-3.5 py-1 text-xs"
                      : "px-4 py-1.5 text-[13px]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <ThemeToggle />
            <AuthButton />
          </nav>

          {/* MOBILE TOGGLE */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </motion.header>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-60 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-[var(--bg-secondary)] z-70 shadow-2xl md:hidden flex flex-col border-l border-[var(--border-primary)]"
            >
              <div className="p-5 flex items-center justify-between border-b border-[var(--border-primary)]">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full border border-[var(--border-primary)]"
                  aria-label="Close Menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] font-semibold text-sm transition-colors group"
                  >
                    <div className="p-1.5 rounded-full bg-[var(--bg-surface)] group-hover:bg-[var(--bg-secondary)] transition-colors text-[var(--accent-primary)]">
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="p-5 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/50">
                <AuthButton mobile />
                <p className="text-center text-[10px] text-[var(--text-muted)] mt-3 font-mono uppercase tracking-wider">
                  NexusNode AI • Multimodal RAG
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
