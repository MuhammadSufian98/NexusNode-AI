"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { settingsApi } from "@/services/settingsApi";
import { createInitialSettings, formatSettingsConfig } from "@/types/schemas";

/**
 * Domain store for User Settings, Neural Engine BYOK Configuration, and Vault Security Actions
 */
export const useSettingsStore = create((set, get) => ({
  config: createInitialSettings(),
  selectedProvider: "openai",
  useCustomKeys: false,
  apiKey: "",
  theme: "light",
  language: "en",
  savedConfig: {
    openai: { configured: false, maskedKey: "" },
    gemini: { configured: false, maskedKey: "" },
  },

  // Action status indicators
  loadingConfig: true,
  savingKey: false,
  wiping: false,
  resetting: false,
  indexing: false,

  // Setters
  setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
  setUseCustomKeys: (useCustomKeys) => set({ useCustomKeys }),
  setApiKey: (apiKey) => set({ apiKey }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),

  // 1. Fetch & Load Settings
  loadSettings: async () => {
    try {
      set({ loadingConfig: true });
      const res = await settingsApi.getSettingsConfig();
      const payload = res.data || res;

      if (payload) {
        const formatted = formatSettingsConfig(payload);
        set({
          config: formatted,
          selectedProvider: formatted.provider || "openai",
          useCustomKeys: Boolean(formatted.useCustomKeys),
          savedConfig: {
            openai: formatted.openai || { configured: false, maskedKey: "" },
            gemini: formatted.gemini || { configured: false, maskedKey: "" },
          },
          theme: formatted.general?.theme || "light",
          language: formatted.general?.language || "en",
          loadingConfig: false,
        });
        return formatted;
      }
    } catch (err) {
      set({ loadingConfig: false });
      toast.error("Failed to load user settings.");
      return null;
    }
  },

  fetchSettings: async () => get().loadSettings(),

  // 2. Save Neural Engine Key
  saveNeuralKey: async ({ provider, apiKey, useCustomKeys = true }) => {
    const targetProvider = provider || get().selectedProvider;
    const targetKey = apiKey || get().apiKey;

    if (!targetKey || !targetKey.trim()) {
      toast.error("Please enter a valid API key string.");
      return false;
    }

    try {
      set({ savingKey: true });
      const res = await settingsApi.saveNeuralKey({
        provider: targetProvider,
        apiKey: targetKey.trim(),
        useCustomKeys,
      });

      if (res.success || res.status === "success") {
        toast.success(res.message || "API key saved securely.");
        set((state) => ({
          savedConfig: {
            ...state.savedConfig,
            [targetProvider]: {
              configured: true,
              maskedKey: res.maskedKey || "••••••••••••",
            },
          },
          apiKey: "",
          useCustomKeys: true,
          savingKey: false,
        }));
        return true;
      }
      set({ savingKey: false });
      return false;
    } catch (err) {
      set({ savingKey: false });
      toast.error(err.message || "Failed to encrypt and store key.");
      return false;
    }
  },

  // 3. Vault Purge / Wipe
  purgeVault: async () => {
    try {
      set({ wiping: true });
      const res = await settingsApi.purgeVault();
      toast.success(res.message || "Vault purged successfully.");
      set({ wiping: false });
      return true;
    } catch (err) {
      set({ wiping: false });
      toast.error(err.message || "Wipe failed.");
      return false;
    }
  },

  // 4. Clear Chat Logs
  clearChatLogs: async () => {
    try {
      set({ resetting: true });
      const res = await settingsApi.clearChatLogs();
      toast.success(res.message || "Chat logs cleared successfully.");
      set({ resetting: false });
      return true;
    } catch (err) {
      set({ resetting: false });
      toast.error(err.message || "Failed to clear logs.");
      return false;
    }
  },

  // 5. Reindex Assets
  reindexAssets: async () => {
    try {
      set({ indexing: true });
      const res = await settingsApi.reindexAssets();
      toast.success(res.message || "Vault assets reindexed.");
      set({ indexing: false });
      return true;
    } catch (err) {
      set({ indexing: false });
      toast.error(err.message || "Reindexing failed.");
      return false;
    }
  },
}));

export default useSettingsStore;
