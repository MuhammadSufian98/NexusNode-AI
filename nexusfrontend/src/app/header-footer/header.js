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
} from "lucide-react";
import GlassButton from "@/component/Button";
import { useAuth } from "@/store/authStore";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Destructure user from Auth Context
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
    { name: "How it works", link: "#how-it-works", icon: <Zap size={18} /> },
    { name: "Features", link: "#features", icon: <Shield size={18} /> },
    { name: "Pricing", link: "#pricing", icon: <Globe size={18} /> },
  ];

  // Helper component to avoid repetition
  const AuthButton = ({ mobile = false }) => (
    <Link href={user ? "/dashboard" : "/auth/login"}>
      <GlassButton
        className={`${
          mobile
            ? "w-full py-4 rounded-2xl"
            : "text-[12px] px-6 py-2.5 rounded-xl"
        } font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-linear-to-r from-rose-600 to-orange-500 border-none text-white shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all`}
      >
        {user ? (
          <>
            {mobile && <LayoutDashboard size={20} />} Launch App
            <ChevronRight size={14} />
          </>
        ) : (
          <>
            Sign In
            <LogIn size={14} />
          </>
        )}
      </GlassButton>
    </Link>
  );

  return (
    <>
      <div className="fixed top-0 w-full z-50 px-[5%] py-4 md:px-10 pointer-events-none">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            width: isScrolled ? "auto" : "100%",
          }}
          className={`mx-auto flex items-center justify-between px-5 md:px-8 pointer-events-auto transition-all duration-500 rounded-4xl border border-white/40 shadow-2xl shadow-rose-100/20 backdrop-blur-2xl ${
            isScrolled
              ? "bg-white/70 py-2.5 mt-2 max-w-4xl"
              : "bg-white/40 py-4 mt-0 max-w-7xl"
          }`}
        >
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 md:w-9 md:h-9 group-hover:rotate-12 transition-transform duration-500">
              <Image
                src="/favicon/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-base md:text-lg font-black tracking-tight text-slate-900">
              NexusNode<span className="text-rose-600">AI</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1 bg-slate-900/5 rounded-2xl p-1 border border-slate-200/20">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-rose-600 rounded-xl hover:bg-white transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <AuthButton />
          </nav>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/5 text-slate-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </motion.header>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-60 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-white z-70 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b">
                <span className="font-black text-slate-900">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-50 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t bg-slate-50/50">
                <AuthButton mobile />
                <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-[0.2em]">
                  NexusNode AI v1.0
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
