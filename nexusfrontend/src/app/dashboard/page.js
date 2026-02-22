"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MessageSquare,
  Settings,
  Send,
  FileText,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const menuItems = [
    { id: "profile", label: "My Profile", icon: <User size={20} /> },
    { id: "chat", label: "Nexus Chat", icon: <MessageSquare size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    // Changed bg-slate-950 to bg-slate-50 and text-white to text-slate-900
    <div className="flex h-screen w-full bg-slate-50 p-4 text-slate-900 overflow-hidden font-sans">
      {/* --- SIDEBAR --- */}
      {/* Changed bg-white/5 to bg-white/70 and border color */}
      <motion.aside className="w-64 h-full backdrop-blur-2xl bg-white/70 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl flex flex-col p-6 mr-4">
        <div className="mb-10 px-2 text-xl font-black tracking-tighter italic">
          NEXUS<span className="text-blue-600">NODE</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 border ${
                activeTab === item.id
                  ? "bg-blue-600/10 border-blue-500/20 text-blue-600 shadow-sm"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
          v1.0.4 Premium
        </div>
      </motion.aside>

      {/* --- MAIN STAGE --- */}
      {/* Changed bg-white/5 to bg-white/80 */}
      <main className="flex-1 h-full relative backdrop-blur-xl bg-white/80 border border-slate-200 shadow-2xl shadow-slate-200/40 rounded-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          {/* 1. CHAT INTERFACE */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-full"
            >
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                  Nexus Intelligence Chat
                </h2>
                <button className="text-[10px] font-bold uppercase tracking-tight bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-all">
                  Clear Thread
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600/5 flex items-center justify-center border border-blue-500/10">
                    <FileText size={32} className="text-blue-500" />
                  </div>
                  <p className="text-xs font-medium max-w-[200px] text-center leading-relaxed">
                    Upload a PDF in the sidebar to begin analyzing data...
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/50 border-t border-slate-100">
                <div className="relative max-w-4xl mx-auto">
                  <input
                    type="text"
                    placeholder="Ask anything about your document..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm"
                  />
                  <button className="absolute right-3 top-2 w-10 h-10 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200">
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. PROFILE SCREEN */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="p-12 flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-purple-600 border-4 border-white mb-6 shadow-2xl rotate-3" />
              <h2 className="text-3xl font-black tracking-tight">Sufian</h2>
              <p className="text-slate-400 mb-8 font-mono text-xs tracking-[0.3em] font-bold">
                S23BDOCS1E02059
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Documents
                  </p>
                  <p className="text-2xl font-black">12</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    AI Queries
                  </p>
                  <p className="text-2xl font-black">458</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SETTINGS SCREEN */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-12"
            >
              <h2 className="text-2xl font-black tracking-tight mb-8">
                Platform Settings
              </h2>
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-200 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">High Precision Mode</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        ENABLE DEEPER NEURAL SCANNING
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                    <motion.div
                      layout
                      className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
