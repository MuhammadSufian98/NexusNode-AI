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
import { settingsApi } from "@/utils/apiServices";
import { useGlobal } from "@/store/globalStore";

export default function SettingsView() {
  const fetchOverviewData = useGlobal((state) => state.fetchOverviewData);
  const fetchDocuments = useGlobal((state) => state.fetchDocuments);

  const [activeTab, setActiveTab] = useState("neural");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [useCustomKeys, setUseCustomKeys] = useState(false);

  const [savedConfig, setSavedConfig] = useState({
    openai: { configured: false, maskedKey: "" },
    gemini: { configured: false, maskedKey: "" },
  });

  // Action status indicators
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [wiping, setWiping] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

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
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingConfig(true);
      const res = await settingsApi.getConfig();
      if (res.success && res.data) {
        setSelectedProvider(res.data.provider || "openai");
        setUseCustomKeys(res.data.useCustomKeys || false);
        setSavedConfig({
          openai: res.data.openai,
          gemini: res.data.gemini,
        });
        if (res.data.general) {
          setTheme(res.data.general.theme || "light");
          setLanguage(res.data.general.language || "en");
        }
      }
    } catch (err) {
      toast.error("Failed to load user settings.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key string.");
      return;
    }
    try {
      setSavingKey(true);
      const res = await settingsApi.saveNeuralKey({
        provider: selectedProvider,
        apiKey: apiKey.trim(),
        useCustomKeys: true,
      });

      if (res.success) {
        toast.success(res.message);
        setSavedConfig((prev) => ({
          ...prev,
          [selectedProvider]: {
            configured: true,
            maskedKey: res.maskedKey,
          },
        }));
        setApiKey("");
        setUseCustomKeys(true);
      }
    } catch (err) {
      toast.error(err.message || "Failed to encrypt and store key.");
    } finally {
      setSavingKey(false);
    }
  };

  const handleWipeVault = async () => {
    if (
      !confirm(
        "Are you sure? This will delete all your uploaded documents, chunks, and trees permanently.",
      )
    )
      return;
    try {
      setWiping(true);
      const res = await settingsApi.purgeVault();
      toast.success(res.message);
      await fetchDocuments();
      await fetchOverviewData();
    } catch (err) {
      toast.error(err.message || "Wipe failed.");
    } finally {
      setWiping(false);
    }
  };

  const handleResetHistory = async () => {
    try {
      setResetting(true);
      const res = await settingsApi.clearChatLogs();
      toast.success(res.message);
      await fetchOverviewData();
    } catch (err) {
      toast.error(err.message || "Failed to clear logs.");
    } finally {
      setResetting(false);
    }
  };

  const handleReindex = async () => {
    try {
      setIndexing(true);
      const res = await settingsApi.reindexAssets();
      toast.success(res.message);
      await fetchOverviewData();
    } catch (err) {
      toast.error(err.message || "Reindexing failed.");
    } finally {
      setIndexing(false);
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
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
              Encryption • Custom BYOK • Vault Health
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION CHIPS */}
        <div className="bg-slate-100/70 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon size={12} className={isActive ? "text-rose-600" : ""} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT REGION */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-transparent">
        <AnimatePresence mode="wait">
          {/* 1. NEURAL ENGINE TAB */}
          {activeTab === "neural" && (
            <motion.div
              key="neural"
              {...tabVariants}
              className="space-y-5 max-w-4xl"
            >
              {/* Provider Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Cpu size={14} className="text-rose-600" /> Model Provider
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                    <ShieldCheck size={10} /> AES-256 Vault Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "openai",
                      name: "OpenAI GPT-4o",
                      sub: "Text & Multi-Modal",
                      icon: "https://cdn.worldvectorlogo.com/logos/openai-2.svg",
                    },
                    {
                      id: "gemini",
                      name: "Google Gemini",
                      sub: "Flash & Pro Context",
                      icon: "https://www.gstatic.com/lamda/images/favicon_v1_150160d13fefabc0696.png",
                    },
                  ].map((p) => {
                    const isSelected = selectedProvider === p.id;
                    const isConfigured = savedConfig[p.id]?.configured;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/90 border-rose-400/80 shadow-xs"
                            : "bg-white/40 hover:bg-white/70 border-slate-200/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center p-1.5 shrink-0">
                            <img
                              src={p.icon}
                              alt=""
                              className="h-4 w-auto object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {p.name}
                            </p>
                            <p className="text-[9px] font-medium text-slate-400 uppercase">
                              {p.sub}
                            </p>
                          </div>
                        </div>

                        {isConfigured ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check size={10} /> Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key Input Container */}
              <div className="bg-white/50 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Key size={12} className="text-rose-600" />
                    Configure Secret Key (
                    {selectedProvider === "openai" ? "OpenAI" : "Gemini"})
                  </label>
                  {savedConfig[selectedProvider]?.configured && (
                    <span className="text-[9px] font-mono text-slate-400">
                      Current: {savedConfig[selectedProvider].maskedKey}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 flex items-center bg-white/90 border border-slate-200 rounded-xl px-3 focus-within:border-rose-400 transition-colors">
                    <Lock size={13} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        savedConfig[selectedProvider]?.configured
                          ? "Enter new key to update current..."
                          : `sk-... (${selectedProvider.toUpperCase()} Key)`
                      }
                      className="w-full py-2 text-xs font-medium text-slate-800 outline-none bg-transparent placeholder:text-slate-400"
                    />
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleSaveKey}
                    disabled={savingKey || !apiKey.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {savingKey ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={13} />
                    )}
                    <span>Encrypt & Store</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Keys are secured in MongoDB using AES-256-GCM hardware
                  encryption and loaded strictly into volatile memory during
                  inference.
                </p>
              </div>
            </motion.div>
          )}

          {/* 2. VAULT TAB */}
          {activeTab === "vault" && (
            <motion.div
              key="vault"
              {...tabVariants}
              className="space-y-4 max-w-4xl"
            >
              {/* Danger Zone Purge */}
              <div className="bg-rose-50/50 backdrop-blur-md border border-rose-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      Total Vault Purge
                    </h4>
                    <p className="text-[10px] text-rose-600/90 font-medium mt-0.5">
                      Permanently wipes all uploaded PDF files, vector chunks,
                      trees, and chat sessions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleWipeVault}
                  disabled={wiping}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {wiping ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span>Execute Wipe</span>
                </button>
              </div>

              {/* Maintenance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Trash2 size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Clear Chat Logs
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Clears all message history while preserving documents and
                      embeddings.
                    </p>
                  </div>
                  <button
                    onClick={handleResetHistory}
                    disabled={resetting}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {resetting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Purge Chat History"
                    )}
                  </button>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <RefreshCw size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Re-index Vectors
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Refreshes vector embeddings across all documents in your
                      repository.
                    </p>
                  </div>
                  <button
                    onClick={handleReindex}
                    disabled={indexing}
                    className="text-xs font-bold text-slate-800 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    {indexing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Run Re-indexer"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. PREFERENCES TAB */}
          {activeTab === "general" && (
            <motion.div
              key="general"
              {...tabVariants}
              className="space-y-4 max-w-4xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    System Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="ur">Urdu (Pakistan)</option>
                  </select>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Workspace Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                        theme === "light"
                          ? "bg-white border-rose-400 text-rose-600 shadow-xs"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Sun size={13} /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Moon size={13} /> Dark
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
