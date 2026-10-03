"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Database,
  Globe,
  Key,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight,
  Server,
  Layers,
  HardDrive,
  Sliders,
  Terminal,
} from "lucide-react";
import { useSettingsStore, useOverviewStore, useDocumentStore } from "@/store";

const TABS = [
  {
    id: "neural",
    label: "Neural Engines",
    tag: "LLM & BYOK",
    icon: Cpu,
    description: "Provider routing & encrypted credentials",
  },
  {
    id: "vault",
    label: "Vault Operations",
    tag: "Storage & Indices",
    icon: Database,
    description: "Re-indexing & data lifecycle",
  },
  {
    id: "general",
    label: "Preferences",
    tag: "System UX",
    icon: Globe,
    description: "Theme, typography & locale",
  },
];

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
};

export function SettingsView() {
  const {
    savedConfig,
    selectedProvider,
    useCustomKeys,
    apiKey,
    theme,
    language,
    loadingConfig,
    savingKey,
    wiping,
    resetting,
    indexing,
    loadSettings,
    saveNeuralKey,
    purgeVault,
    clearChatLogs,
    reindexAssets,
    setSelectedProvider,
    setApiKey,
    setTheme,
    setLanguage,
  } = useSettingsStore();

  const fetchOverviewData = useOverviewStore(
    (state) => state.fetchOverviewData,
  );
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

  const [activeTab, setActiveTab] = useState("neural");
  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmPurgeText, setConfirmPurgeText] = useState("");
  const [showPurgePrompt, setShowPurgePrompt] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    const success = await saveNeuralKey({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      useCustomKeys: true,
    });
    if (success && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  };

  const handleWipeVault = async () => {
    if (confirmPurgeText !== "CONFIRM_DELETE") return;
    const success = await purgeVault();
    if (success) {
      setShowPurgePrompt(false);
      setConfirmPurgeText("");
      if (typeof fetchDocuments === "function") await fetchDocuments();
      if (typeof fetchOverviewData === "function") await fetchOverviewData();
    }
  };

  const handleResetHistory = async () => {
    if (!window.confirm("Clear all active chat logs across all documents?"))
      return;
    const success = await clearChatLogs();
    if (success && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  };

  const handleReindex = async () => {
    const success = await reindexAssets();
    if (success && typeof fetchOverviewData === "function") {
      fetchOverviewData();
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col lg:flex-row bg-transparent select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. LEFT NAVIGATION RAIL                                   */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-72 xl:w-80 flex flex-col bg-[#F9FAFB]/80 border-b lg:border-b-0 lg:border-r border-slate-200/80 shrink-0">
        <div className="p-4 border-b border-slate-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Sliders size={16} />
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                System Control
              </h2>
              <p className="font-mono text-[9px] text-slate-400">
                NexusNode Core v2.4 • In-Memory
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons List */}
        <nav className="p-2 space-y-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between group active:scale-[0.98] transition-transform duration-100 ease-out ${
                  isActive
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200/60 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                      isActive
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-slate-50 border-slate-200 text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">
                      {tab.label}
                    </p>
                    <p className="font-mono text-[9px] text-slate-400 truncate mt-0.5">
                      {tab.tag}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={13}
                  className={`hidden lg:block transition-transform shrink-0 ${
                    isActive
                      ? "text-rose-600 translate-x-0.5"
                      : "text-slate-300 group-hover:text-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Bottom Hardware Status Badge */}
        <div className="hidden lg:block mt-auto p-4 border-t border-slate-200/70">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">
                Encryption Engine
              </span>
              <span className="font-mono text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                AES-256-GCM
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-medium">Volatile Sandbox</span>
              <span className="font-mono text-[10px] font-bold text-slate-800">
                Isolated
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT WORKSPACE STAGE                                  */}
      {/* ========================================================= */}
      <section
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar p-4 sm:p-6 lg:p-8"
        data-lenis-prevent
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {/* ========================================================= */}
            {/* TAB 1: NEURAL ENGINE & BYOK KEYS                         */}
            {/* ========================================================= */}
            {activeTab === "neural" && (
              <motion.div
                key="neural-panel"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5"
              >
                {/* Header Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      BYOK Orchestration
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <ShieldCheck size={11} />
                      <span className="font-mono text-[9px] font-bold uppercase">
                        {useCustomKeys ? "Custom BYOK Active" : "Default Core"}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Language Model Routing & Credentials
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    Bring Your Own Key (BYOK) allows direct inference through
                    your private accounts. Keys are encrypted with user-derived
                    salts and decrypted in memory during queries.
                  </p>
                </div>

                {/* Provider Choice Cards */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Select Inference Provider
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OpenAI Card */}
                    <div
                      onClick={() => setSelectedProvider("openai")}
                      className={`p-4 rounded-2xl border-2 transition-colors cursor-pointer flex flex-col justify-between active:scale-[0.98] transition-transform duration-100 ease-out ${
                        selectedProvider === "openai"
                          ? "bg-rose-50/20 border-rose-500"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                            OA
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              OpenAI API
                            </p>
                            <p className="font-mono text-[9px] text-slate-400">
                              GPT-4o • GPT-4o-mini
                            </p>
                          </div>
                        </div>

                        {savedConfig.openai?.configured && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                            <CheckCircle2 size={10} /> Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        High-reasoning synthesis for complex formulas, proofs,
                        and multi-step logic.
                      </p>
                    </div>

                    {/* Google Gemini Card */}
                    <div
                      onClick={() => setSelectedProvider("gemini")}
                      className={`p-4 rounded-2xl border-2 transition-colors cursor-pointer flex flex-col justify-between active:scale-[0.98] transition-transform duration-100 ease-out ${
                        selectedProvider === "gemini"
                          ? "bg-rose-50/20 border-rose-500"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                            GM
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              Google Gemini
                            </p>
                            <p className="font-mono text-[9px] text-slate-400">
                              Gemini 1.5 Pro • Flash
                            </p>
                          </div>
                        </div>

                        {savedConfig.gemini?.configured && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                            <CheckCircle2 size={10} /> Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Extended token context windows with rapid multimodal
                        cross-examination.
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Key Vault Input Form */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900">
                        {selectedProvider === "openai"
                          ? "OpenAI"
                          : "Google Gemini"}{" "}
                        Secret Key
                      </label>
                      {savedConfig[selectedProvider]?.configured && (
                        <span className="font-mono text-[10px] text-slate-400">
                          Active: {savedConfig[selectedProvider]?.maskedKey}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                      Enter credentials to encrypt into the local hardware vault
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Key
                        size={13}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={
                          selectedProvider === "openai"
                            ? "sk-proj-..."
                            : "AIzaSy..."
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 focus:border-rose-400 focus:bg-white rounded-xl py-2 pl-9 pr-10 text-xs font-mono text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        title={showApiKey ? "Hide Key" : "Show Key"}
                      >
                        {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveKey}
                      disabled={savingKey || !apiKey.trim()}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-transform duration-100 ease-out disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
                    >
                      {savingKey ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Encrypting...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={13} />
                          <span>Encrypt & Store</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: VAULT OPERATIONS & MAINTENANCE                     */}
            {/* ========================================================= */}
            {activeTab === "vault" && (
              <motion.div
                key="vault-panel"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Vault Maintenance & Index Synchronization
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    Maintain vector graphs, refresh local embeddings, or clear
                    conversational records while preserving uploaded documents.
                  </p>
                </div>

                {/* Safe Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Action: Reindex */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-rose-600">
                          <RefreshCw size={14} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Recompute Vectors
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Re-calculates 384d semantic vectors across stored chunks
                        using the active embedding model.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReindex}
                      disabled={indexing}
                      className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 active:scale-[0.98] transition-transform duration-100 ease-out disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {indexing && (
                        <Loader2
                          size={12}
                          className="animate-spin text-rose-600"
                        />
                      )}
                      <span>
                        {indexing ? "Synchronizing..." : "Run Re-index"}
                      </span>
                    </button>
                  </div>

                  {/* Action: Clear Logs */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                          <Trash2 size={14} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Purge Chat Transcripts
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Clears all multi-turn dialogue threads and prompt edits.
                        Document nodes remain untouched.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetHistory}
                      disabled={resetting}
                      className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 active:scale-[0.98] transition-transform duration-100 ease-out disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {resetting && (
                        <Loader2
                          size={12}
                          className="animate-spin text-rose-600"
                        />
                      )}
                      <span>{resetting ? "Purging..." : "Clear Threads"}</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle size={16} />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      Destructive Action: Complete Vault Purge
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Permanently deletes all uploaded PDFs, vector chunk
                    embeddings, knowledge trees, and session history from cloud
                    storage and the database.
                  </p>

                  {!showPurgePrompt ? (
                    <button
                      type="button"
                      onClick={() => setShowPurgePrompt(true)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold active:scale-[0.98] transition-transform duration-100 ease-out transition-colors cursor-pointer"
                    >
                      Initiate Vault Wipe
                    </button>
                  ) : (
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                      <p className="font-mono text-[10px] text-rose-800 font-bold">
                        Type CONFIRM_DELETE to proceed:
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={confirmPurgeText}
                          onChange={(e) => setConfirmPurgeText(e.target.value)}
                          placeholder="CONFIRM_DELETE"
                          className="bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleWipeVault}
                          disabled={
                            confirmPurgeText !== "CONFIRM_DELETE" || wiping
                          }
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer shrink-0 active:scale-[0.98] transition-transform duration-100 ease-out"
                        >
                          {wiping ? "Destroying..." : "Execute Purge"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPurgePrompt(false);
                            setConfirmPurgeText("");
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: GENERAL PREFERENCES                                */}
            {/* ========================================================= */}
            {activeTab === "general" && (
              <motion.div
                key="general-panel"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Workspace Configuration
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    Manage visual theme tokens, internationalization, and
                    client-side rendering behaviors.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Theme Selector */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
                    <label className="text-xs font-bold text-slate-900 block">
                      Interface Theme
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out ${
                          theme === "light"
                            ? "bg-rose-50 border-rose-300 text-rose-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Sun size={13} />
                        <span>Light Mode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-100 ease-out ${
                          theme === "dark"
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Moon size={13} />
                        <span>Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
                    <label className="text-xs font-bold text-slate-900 block">
                      Localization
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400 cursor-pointer"
                    >
                      <option value="en">English (United States)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default SettingsView;
