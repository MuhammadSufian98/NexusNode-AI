"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight, User } from "lucide-react";
import GlassButton from "@/component/Button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "How it works", link: "#how-it-works" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
  ];

  return (
    <div className="fixed top-0 w-full z-50 px-6 py-4 md:px-10 pointer-events-none">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          width: isScrolled ? "auto" : "100%",
          maxWidth: "1200px",
        }}
        className={`mx-auto flex items-center justify-between px-6 md:px-10 pointer-events-auto transition-all duration-500 rounded-4xl border border-white/40 shadow-2xl shadow-rose-100/20 backdrop-blur-2xl ${
          isScrolled ? "bg-white/60 py-3 mt-2" : "bg-white/30 py-5 mt-0"
        }`}
      >
        {/* Logo Section using logo.png */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 group-hover:rotate-12 transition-transform duration-500">
            <Image
              src="/favicon/logo.png"
              alt="NexusNode AI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">
            NexusNode<span className="text-rose-600">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-slate-900/5 rounded-2xl p-1 border border-slate-200/20 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-rose-600 rounded-xl hover:bg-white/80 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <Link href="/dashboard">
            <GlassButton className="text-[13px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xl shadow-rose-100 bg-linear-to-r from-rose-600 to-orange-500 border-none text-white">
              Launch App <ChevronRight size={14} />
            </GlassButton>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-24 inset-x-6 bg-white/90 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto md:hidden"
          >
            <div className="flex flex-col gap-6 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-bold text-slate-900 hover:text-rose-600"
                >
                  {item.name}
                </Link>
              ))}
              <hr className="w-full border-slate-100" />
              <Link href="/dashboard" className="w-full">
                <GlassButton className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-linear-to-r from-rose-600 to-orange-500 border-none text-white">
                  <User size={18} /> Dashboard
                </GlassButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
