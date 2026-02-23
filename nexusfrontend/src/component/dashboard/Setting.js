"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

export default function SettingsView() {
  const [enginePower, setEnginePower] = useState(85);
  const [isAutoSync, setIsAutoSync] = useState(true);

  const sectionVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="h-full max-h-[calc(100vh-140px)] flex flex-col gap-6 p-1 pb-8 overflow-hidden select-none">
      {/* --- HEADER --- */}
      <div className="shrink-0">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings
            className="text-rose-600 animate-[spin_4s_linear_infinite]"
            size={24}
          />
          CORE PREFERENCES
        </h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Configure Neural Engine & Workspace Parameters
        </p>
      </div>

      {/* --- SETTINGS GRID --- */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
        {/* COLUMN 1: NEURAL CONFIG */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-[2.5rem] shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 shadow-inner">
                <Cpu size={18} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                Neural Engine
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase">
                    Processing Power
                  </label>
                  <span className="text-xs font-black text-rose-600">
                    {enginePower}%
                  </span>
                </div>
                <input
                  type="range"
                  value={enginePower}
                  onChange={(e) => setEnginePower(e.target.value)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-800 uppercase">
                    Context Injection
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">
                    Enhanced Accuracy
                  </span>
                </div>
                <button
                  onClick={() => setIsAutoSync(!isAutoSync)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isAutoSync ? "bg-rose-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoSync ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUMN 2: STORAGE & SECURITY */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-[2.5rem] shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500 shadow-inner">
                <Database size={18} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                Vault & Data
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase leading-none">
                      Local Cache
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                      1.2 GB utilized
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase leading-none">
                      End-to-End
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                      AES-256 Active
                    </p>
                  </div>
                </div>
                <Globe size={14} className="text-slate-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUMN 3: INTERFACE & ACTIONS */}
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-[2.5rem] shadow-sm flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
                  <Palette size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                  Workspace
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg">
                  Dark Mode
                </button>
                <button className="p-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-rose-600 transition-colors">
                  Compact UI
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all group">
                <Trash2 size={14} className="group-hover:animate-bounce" />
                Purge All Data
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Export System Log
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- SYSTEM STATUS BAR --- */}
      <div className="shrink-0 bg-slate-900 rounded-4xl p-4 flex items-center justify-between text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-rose-600/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-rose-500 fill-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Version 4.2.0 Stable
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Bell size={12} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              Updates Available
            </span>
          </div>
        </div>
        <button className="relative z-10 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
          Check Integrity
        </button>
      </div>
    </div>
  );
}
