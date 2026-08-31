"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Settings,
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
  Check,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { useSettingsStore, useOverviewStore, useDocumentStore } from "@/store";

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
    setUseCustomKeys,
    setApiKey,
    setTheme,
    setLanguage,
  } = useSettingsStore();

  const fetchOverviewData = useOverviewStore((state) => state.fetchOverviewData);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

  const [activeTab, setActiveTab] = useState("neural");
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs = [
    { id: "neural", label: "Neural Engine", icon: Cpu },
    { id: "vault", label: "Vault Security", icon: Database },
    { id: "general", label: "Preferences", icon: Globe },
  ];

  const tabVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveKey = async () => {
    const success = await saveNeuralKey({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      useCustomKeys: true,
    });
    if (success) {
      fetchOverviewData();
    }
  };

  const handleWipeVault = async () => {
    if (
      !confirm(
        "Are you sure? This will delete all your uploaded documents, chunks, and trees permanently."
      )
    )
      return;

    const success = await purgeVault();
    if (success) {
      await fetchDocuments();
      await fetchOverviewData();
    }
  };

  const handleResetHistory = async () => {
    const success = await clearChatLogs();
    if (success) {
      await fetchOverviewData();
    }
  };

  const handleReindex = async () => {
    const success = await reindexAssets();
    if (success) {
      await fetchOverviewData();
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl overflow-hidden relative select-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3.5 border-b border-slate-100/90 shrink-0 bg-white/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/10 via-orange-500/10 to-amber-500/10 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
            <Settings size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              System Settings & Security
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Configure neural backends, BYOK credentials, and vault maintenance
            </p>
          </div>
        </div>

        {/* TAB TOGGLES */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon
                  size={13}
                  className={isActive ? "text-rose-600" : "text-slate-400"}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT REGION */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar min-h-0">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* TAB 1: NEURAL ENGINE & BYOK */}
            {activeTab === "neural" && (
              <motion.div
                key="tab-neural"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                {/* Status Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 text-white border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-transparent blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                          Neural Gateway Status
                        </span>
                      </div>
                      <h3 className="text-base font-bold">
                        Bring Your Own Key (BYOK) Architecture
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        API keys are AES-256 encrypted in transit and at rest.
                        Zero payload logs are kept on central proxies.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {useCustomKeys ? "BYOK Active" : "Nexus Default Core"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Provider Selection */}
                <div className="bg-white/70 border border-slate-200/90 rounded-2xl p-4 md:p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-1">
                      Target Neural Engine
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Select which foundational model backend to route vector grounding queries through.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OpenAI Option */}
                    <div
                      onClick={() => setSelectedProvider("openai")}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedProvider === "openai"
                          ? "border-rose-500 bg-rose-50/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            OA
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            OpenAI API
                          </span>
                        </div>
                        {savedConfig.openai?.configured && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        GPT-4o / GPT-4o-mini text generation and vector synthesis.
                      </p>
                    </div>

                    {/* Gemini Option */}
                    <div
                      onClick={() => setSelectedProvider("gemini")}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedProvider === "gemini"
                          ? "border-rose-500 bg-rose-50/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xs">
                            GM
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            Google Gemini
                          </span>
                        </div>
                        {savedConfig.gemini?.configured && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Gemini 1.5 Pro / Flash models with long context window support.
                      </p>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Configure {selectedProvider === "openai" ? "OpenAI" : "Google Gemini"} Key
                      </label>
                      {savedConfig[selectedProvider]?.configured && (
                        <p className="text-[11px] text-slate-500 font-mono mb-2">
                          Current Stored Key: {savedConfig[selectedProvider]?.maskedKey}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Key
                          size={14}
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
                          className="w-full bg-white border border-slate-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 rounded-xl py-2 pl-9 pr-10 text-xs font-mono text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>

                      <button
                        onClick={handleSaveKey}
                        disabled={savingKey || !apiKey.trim()}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white rounded-xl text-xs font-bold shadow-xs active:scale-97 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
                      >
                        {savingKey ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Encrypting...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={13} />
                            <span>Save Key</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: VAULT SECURITY & ACTIONS */}
            {activeTab === "vault" && (
              <motion.div
                key="tab-vault"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div className="bg-white/70 border border-slate-200/90 rounded-2xl p-4 md:p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Vault Maintenance & Indices
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Rebuild local vector embeddings or safely purge stored document catalogs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Action 1: Reindex */}
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                          <RefreshCw size={14} className="text-rose-500" />
                          <span>Reindex Semantic Vectors</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Re-calculates document embeddings across current provider models.
                        </p>
                      </div>
                      <button
                        onClick={handleReindex}
                        disabled={indexing}
                        className="self-start px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {indexing && <Loader2 size={12} className="animate-spin" />}
                        <span>{indexing ? "Reindexing..." : "Run Reindex"}</span>
                      </button>
                    </div>

                    {/* Action 2: Clear Chat History */}
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                          <Trash2 size={14} className="text-amber-500" />
                          <span>Clear Chat Logs</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Wipes all past conversation transcripts without deleting documents.
                        </p>
                      </div>
                      <button
                        onClick={handleResetHistory}
                        disabled={resetting}
                        className="self-start px-3 py-1.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-lg text-xs font-semibold text-amber-700 active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {resetting && <Loader2 size={12} className="animate-spin" />}
                        <span>{resetting ? "Clearing..." : "Clear Chat Logs"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone: Wipe Vault */}
                  <div className="mt-4 p-4 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle size={15} />
                      <span>Danger Zone: Permanent Vault Wipe</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Permanently destroys all documents, chunks, generated knowledge trees, and user indices.
                    </p>
                    <button
                      onClick={handleWipeVault}
                      disabled={wiping}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold active:scale-97 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      {wiping && <Loader2 size={12} className="animate-spin" />}
                      <span>{wiping ? "Wiping Vault..." : "Purge All Data"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: PREFERENCES */}
            {activeTab === "general" && (
              <motion.div
                key="tab-general"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div className="bg-white/70 border border-slate-200/90 rounded-2xl p-4 md:p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                      UI & Workspace Experience
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Customize interface rendering, typography scale, and language localization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Appearance Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme("light")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-97 ${
                            theme === "light"
                              ? "bg-white border-rose-400 text-slate-900 shadow-xs"
                              : "border-slate-200 text-slate-500"
                          }`}
                        >
                          <Sun size={13} className="text-amber-500" />
                          <span>Light</span>
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-97 ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                              : "border-slate-200 text-slate-500"
                          }`}
                        >
                          <Moon size={13} />
                          <span>Dark</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
