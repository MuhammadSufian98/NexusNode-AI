"use client";

import React from "react";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

const FloatingFooter = () => {
  return (
    <div className="w-full px-6 pb-8 pt-12 bg-transparent pointer-events-none">
      <footer className="max-w-7xl mx-auto p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 bg-white/40 backdrop-blur-xl shadow-2xl shadow-indigo-100/20 pointer-events-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <div className="text-xl font-black text-slate-900 tracking-tighter">
              NexusNode<span className="text-indigo-600">AI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
              Building the future of document AI with neural retrieval.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://github.com/MuhammadSufian98"
                className="p-2 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {[
            { title: "Product", links: ["Features", "API", "Docs"] },
            { title: "Company", links: ["About Us", "Privacy", "Terms"] },
            { title: "Connect", links: ["Twitter / X", "GitHub", "LinkedIn"] },
          ].map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === "GitHub"
                          ? "https://github.com/MuhammadSufian98"
                          : "#"
                      }
                      className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
                    >
                      {link}{" "}
                      <ExternalLink
                        size={12}
                        className="opacity-0 group-hover:opacity-100 -translate-y-1 transition-all"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © 2026 NexusNodeAI. All rights reserved.
          </p>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </div>
      </footer>
    </div>
  );
};

export default FloatingFooter;
