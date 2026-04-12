"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Cpu,
  ShieldCheck,
  Palette,
  HardDrive,
  Bell,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Database,
  Key,
  Languages,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Activity,
  Terminal,
  ChevronRight,
} from "lucide-react";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("neural");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "neural", label: "Neural", icon: Cpu },
    { id: "vault", label: "Vault", icon: Database },
  ];

  const tabVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="grid lg:grid-cols-12 gap-4 md:gap-6 h-full min-h-0 overflow-y-auto lg:overflow-hidden pb-2">
      {/* --- LEFT STAGE: MAIN CONFIG (8 Cols) --- */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden relative min-h-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 md:p-5 border-b border-slate-50 shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Settings
                className="text-rose-600 animate-[spin_8s_linear_infinite]"
                size={18}
              />
            </div>
            <div>
              <h2 className="font-black text-xs tracking-widest uppercase text-slate-900">
                System Preferences
              </h2>
              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
                Node Version 4.2.0-Stable
              </p>
            </div>
          </div>

          {/* Tab Slider Integrated into Header */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 w-full md:w-auto md:min-w-70">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-1.5 text-[9px] font-black uppercase tracking-[0.08em] md:tracking-widest transition-colors ${
                  activeTab === tab.id ? "text-rose-600" : "text-slate-500"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="settingTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm z-[-1]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Internal Scroll Only */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50/20">
          <AnimatePresence mode="wait">
            {activeTab === "neural" && (
              <motion.div key="neural" {...tabVariants} className="space-y-8">
                {/* Inference Provider */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Primary Inference Stage
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["openai", "gemini"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedProvider(p)}
                        className={`p-6 rounded-4xl border-2 transition-all flex items-center justify-between ${selectedProvider === p ? "border-rose-500 bg-white shadow-lg shadow-rose-100" : "border-slate-100 bg-white/50 hover:border-slate-200"}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              p === "openai"
                                ? "https://cdn.worldvectorlogo.com/logos/openai-2.svg"
                                : "https://www.gstatic.com/lamda/images/favicon_v1_150160d13fefabc0696.png"
                            }
                            className="h-6 w-auto"
                            alt=""
                          />
                          <span className="text-xs font-black uppercase tracking-widest">
                            {p}
                          </span>
                        </div>
                        {selectedProvider === p && (
                          <CheckCircle2 size={18} className="text-rose-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key Dock */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Security Credentials
                  </h3>
                  <div className="flex flex-col md:flex-row gap-2 p-2 bg-white border border-slate-200 rounded-3xl md:items-center shadow-sm">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Key size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter Secret ${selectedProvider.toUpperCase()} Key`}
                      className="flex-1 bg-transparent px-2 text-xs font-bold text-slate-700 outline-none"
                    />
                    <div className="flex gap-1 w-full md:w-auto">
                      <button
                        onClick={() => setApiKey("")}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-xl hover:bg-slate-100 transition-all"
                      >
                        Clear
                      </button>
                      <button className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-rose-600 transition-all">
                        Activate
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div key="vault" {...tabVariants} className="space-y-6">
                <div className="bg-rose-50/50 border border-rose-100 p-5 md:p-6 rounded-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">
                      Total Data Purge
                    </h4>
                    <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">
                      Permanently remove all vector embeddings
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-rose-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-rose-200">
                    Execute Wipe
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-slate-100 rounded-4xl space-y-2">
                    <Trash2 size={20} className="text-slate-400" />
                    <p className="text-[10px] font-black text-slate-800 uppercase">
                      Clear Chat Logs
                    </p>
                    <button className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">
                      Reset History
                    </button>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-4xl space-y-2">
                    <RefreshCw size={20} className="text-slate-400" />
                    <p className="text-[10px] font-black text-slate-800 uppercase">
                      Re-index Assets
                    </p>
                    <button className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">
                      Start Engine
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div
                key="general"
                {...tabVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                    Localization
                  </label>
                  <select className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-black text-slate-700 focus:ring-4 focus:ring-rose-500/10 outline-none appearance-none cursor-pointer">
                    <option>English (United States)</option>
                    <option>Urdu (Pakistan)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                    Appearance
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 p-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest">
                      Night
                    </button>
                    <button className="flex-1 p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                      Day
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Action Dock */}
        <div className="p-5 border-t border-slate-50 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-rose-600" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                Identity Verified Stage
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: DIAGNOSTICS & STATUS (4 Cols) --- */}
      <div className="lg:col-span-4 flex flex-col gap-5 overflow-hidden min-h-0">
        {/* Resource Allocation Card */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Activity size={16} className="text-rose-600" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">
              Live Resources
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl text-center group hover:bg-rose-50 transition-colors">
              <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-rose-600 transition-colors">
                1.2GB
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">
                Vault Capacity
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl text-center group hover:bg-rose-50 transition-colors">
              <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-rose-600 transition-colors">
                842
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">
                Neural Chunks
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">
                Integrity Score
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase">
                98%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "98%" }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Engine Metadata */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden group flex-1">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100/40 blur-2xl rounded-full pointer-events-none" />

          <h3 className="relative z-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Zap size={14} className="text-rose-500" /> Meta Intelligence
          </h3>

          <div className="relative z-10 space-y-2">
            {[
              { label: "Latency", val: "240ms" },
              { label: "Token Rate", val: "8k/min" },
              { label: "Version", val: "4.2.0-S" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"
              >
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  {stat.label}
                </span>
                <span className="text-[10px] font-black text-slate-800 uppercase">
                  {stat.val}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest border-b border-rose-200 pb-1 flex items-center gap-1">
              View System Logs <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
