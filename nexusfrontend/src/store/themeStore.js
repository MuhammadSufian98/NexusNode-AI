"use client";

import { create } from "zustand";

const themeTokens = {
  light: {
    "--bg-primary": "#f8fafc",
    "--bg-secondary": "#ffffff",
    "--bg-surface": "#e2e8f0",
    "--bg-glass": "rgba(255, 255, 255, 0.75)",
    "--border-primary": "rgba(226, 232, 240, 0.8)",
    "--border-highlight": "rgba(244, 63, 94, 0.3)",
    "--text-primary": "#0f172a",
    "--text-secondary": "#475569",
    "--text-muted": "#94a3b8",
    "--accent-primary": "#e11d48",
    "--accent-hover": "#be123c",
    "--accent-gradient": "linear-gradient(135deg, #e11d48 0%, #f97316 100%)",
    "--user-bubble-bg": "#0f172a",
    "--user-bubble-text": "#ffffff",
    "--assistant-bubble-bg": "#ffffff",
    "--assistant-bubble-border": "rgba(226, 232, 240, 0.8)",
    "--assistant-bubble-text": "#334155",
    "--citation-card-bg": "#ffffff",
    "--citation-card-border": "rgba(226, 232, 240, 0.8)",
    "--citation-badge": "#e11d48",
    "--code-block-bg": "#0f172a",
  },
  dark: {
    "--bg-primary": "#030712",
    "--bg-secondary": "#0f172a",
    "--bg-surface": "#1e293b",
    "--bg-glass": "rgba(15, 23, 42, 0.75)",
    "--border-primary": "rgba(255, 255, 255, 0.08)",
    "--border-highlight": "rgba(16, 185, 129, 0.3)",
    "--text-primary": "#f8fafc",
    "--text-secondary": "#94a3b8",
    "--text-muted": "#64748b",
    "--accent-primary": "#10b981",
    "--accent-hover": "#059669",
    "--accent-gradient": "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    "--user-bubble-bg": "#059669",
    "--user-bubble-text": "#ffffff",
    "--assistant-bubble-bg": "#0b1329",
    "--assistant-bubble-border": "rgba(51, 65, 85, 0.6)",
    "--assistant-bubble-text": "#e2e8f0",
    "--citation-card-bg": "rgba(15, 23, 42, 0.9)",
    "--citation-card-border": "rgba(16, 185, 129, 0.25)",
    "--citation-badge": "#34d399",
    "--code-block-bg": "#020617",
  },
};

export const useTheme = create((set, get) => ({
  theme: "light",
  initTheme: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("nexus-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (systemDark ? "dark" : "light");
    get().setTheme(initialTheme);
  },
  setTheme: (theme) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nexus-theme", theme);
    const root = document.documentElement;
    const tokens = themeTokens[theme];

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    Object.entries(tokens).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    set({ theme });
  },
}));
