"use client";

import React from "react";
import Image from "next/image";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

const FloatingFooter = () => {
  return (
    <div className="w-full px-6 pb-8 pt-12 bg-transparent pointer-events-none">
      <footer className="max-w-7xl mx-auto p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 bg-white/40 backdrop-blur-xl shadow-2xl shadow-rose-100/20 pointer-events-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/favicon/logo.png"
                  alt="NexusNode AI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-xl font-black text-slate-900 tracking-tighter">
                NexusNode<span className="text-rose-600">AI</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed max-w-55">
              Building the future of document intelligence with advanced neural
              retrieval systems.
            </p>

            <div className="flex gap-3">
              {[
                {
                  icon: <Github size={18} />,
                  href: "https://github.com/MuhammadSufian98",
                },
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Linkedin size={18} />, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {[
            { title: "Product", links: ["Features", "API", "Docs"] },
            { title: "Company", links: ["About Us", "Privacy", "Terms"] },
            { title: "Connect", links: ["Twitter / X", "GitHub", "LinkedIn"] },
          ].map((column) => (
            <div key={column.title} className="flex flex-col gap-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === "GitHub"
                          ? "https://github.com/MuhammadSufian98"
                          : "#"
                      }
                      className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1 group w-fit"
                    >
                      {link}
                      <ExternalLink
                        size={12}
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              © 2026 NexusNodeAI
            </p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
            <p className="text-[10px] text-slate-400 font-medium">
              Precision Document Intelligence Systems
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FloatingFooter;
