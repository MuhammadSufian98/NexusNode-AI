"use client";

import React, { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Twitter = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FloatingFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <Github size={18} />,
      href: "https://github.com/MuhammadSufian98",
      label: "GitHub",
    },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Mail size={18} />, href: "#", label: "Email" },
  ];

  const footerGroups = [
    {
      title: "Platform",
      links: ["Features", "Neural Engine", "Security", "Pricing"],
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Changelog", "GitHub"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  return (
    <div className="w-full px-[5%] pb-10 pt-20 bg-transparent pointer-events-none">
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto p-10 md:p-16 rounded-[3rem] border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(225,29,72,0.1)] pointer-events-auto flex flex-col gap-16 overflow-hidden relative"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-200/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* --- BRAND FOOTPRINT --- */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 hover:rotate-15 transition-transform duration-500">
                  <Image
                    src="/favicon/logo.png"
                    alt="NexusNode AI Logo"
                    fill
                    sizes="40px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">
                  NexusNode<span className="text-rose-600">AI</span>
                </span>
              </div>
              <p className="text-base text-slate-500 leading-relaxed max-w-sm">
                Redefining document intelligence through high-performance neural
                retrieval and context-aware AI architecture.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-white/50 border border-slate-200/50 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-rose-100 hover:shadow-lg"
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* --- LINK TRACKS --- */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            {footerGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href={
                          link === "GitHub"
                            ? "https://github.com/MuhammadSufian98"
                            : "#"
                        }
                        className="text-[15px] font-semibold text-slate-600 hover:text-rose-600 transition-all flex items-center gap-1 group w-fit"
                      >
                        <span className="relative">
                          {link}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 transition-all duration-300 group-hover:w-full" />
                        </span>
                        {link === "GitHub" && (
                          <ArrowUpRight
                            size={14}
                            className="opacity-0 group-hover:opacity-100 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-10 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-center md:text-left">
            <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">
              © {currentYear} NexusNodeAI
            </span>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              Sufian's Final Year Project • IUB
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/50 border border-rose-100/50 backdrop-blur-sm shadow-sm group hover:border-rose-300 transition-colors duration-500">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </div>
            <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">
              Neural Nodes Active
            </span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default memo(FloatingFooter);
