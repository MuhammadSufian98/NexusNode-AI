import { create } from "zustand";

export const PALETTES = {
  // 1. Signature NexusNode AI (Light)
  nexusWarm: {
    id: "nexus-warm",
    name: "Nexus Obsidian & Warm Sunset",
    main: "#E11D48",
    mainHover: "#BE123C",
    mid: "#F97316",
    highlight: "#F59E0B",
    accentSuccess: "#10B981",
    bgCanvas: "#FAF9F6",
    bgSurface: "#FFFFFF",
    borderBase: "rgba(226, 232, 240, 0.8)",
    textPrimary: "#0F172A",
    textMuted: "#64748B",
    glowShadow: "rgba(225, 29, 72, 0.15)",
  },

  // 2. Cyber Obsidian (Dark Mode)
  cyberObsidian: {
    id: "cyber-obsidian",
    name: "Cyber Obsidian Dark",
    main: "#F43F5E",
    mainHover: "#E11D48",
    mid: "#FB923C",
    highlight: "#FBBF24",
    accentSuccess: "#34D399",
    bgCanvas: "#09090B",
    bgSurface: "#18181B",
    borderBase: "rgba(39, 39, 42, 0.8)",
    textPrimary: "#F8FAFC",
    textMuted: "#94A3B8",
    glowShadow: "rgba(244, 63, 94, 0.22)",
  },
};

export const useThemeStore = create((set, get) => ({
  theme: "light",
  activePaletteKey: "nexusWarm",
  palette: PALETTES.nexusWarm,

  // Initialize theme from storage
  initTheme: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("nn_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");

    const root = document.documentElement;
    if (initialTheme === "dark") {
      root.classList.add("dark");
      set({
        theme: "dark",
        activePaletteKey: "cyberObsidian",
        palette: PALETTES.cyberObsidian,
      });
      get().applyCssVariables(PALETTES.cyberObsidian);
    } else {
      root.classList.remove("dark");
      set({
        theme: "light",
        activePaletteKey: "nexusWarm",
        palette: PALETTES.nexusWarm,
      });
      get().applyCssVariables(PALETTES.nexusWarm);
    }
  },

  // Set explicit theme ('light' | 'dark')
  setTheme: (newTheme) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nn_theme", newTheme);
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
      set({
        theme: "dark",
        activePaletteKey: "cyberObsidian",
        palette: PALETTES.cyberObsidian,
      });
      get().applyCssVariables(PALETTES.cyberObsidian);
    } else {
      root.classList.remove("dark");
      set({
        theme: "light",
        activePaletteKey: "nexusWarm",
        palette: PALETTES.nexusWarm,
      });
      get().applyCssVariables(PALETTES.nexusWarm);
    }
  },

  // Set predefined palette
  setPalette: (paletteKey) => {
    const nextPalette = PALETTES[paletteKey] || PALETTES.nexusWarm;
    set({ activePaletteKey: paletteKey, palette: nextPalette });
    get().applyCssVariables(nextPalette);
  },

  // Custom live token adjustments
  updateCustomToken: (tokenKey, value) => {
    const updated = { ...get().palette, [tokenKey]: value };
    set({ palette: updated });
    get().applyCssVariables(updated);
  },

  // Injects CSS variables onto :root
  applyCssVariables: (tokens) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--color-main", tokens.main);
    root.style.setProperty("--color-main-hover", tokens.mainHover);
    root.style.setProperty("--color-mid", tokens.mid);
    root.style.setProperty("--color-highlight", tokens.highlight);
    root.style.setProperty("--color-success", tokens.accentSuccess);
    root.style.setProperty("--color-canvas", tokens.bgCanvas);
    root.style.setProperty("--color-surface", tokens.bgSurface);
    root.style.setProperty("--color-border", tokens.borderBase);
    root.style.setProperty("--color-text-primary", tokens.textPrimary);
    root.style.setProperty("--color-text-muted", tokens.textMuted);
    root.style.setProperty("--color-glow", tokens.glowShadow);
  },
}));

export const useTheme = useThemeStore;
export default useThemeStore;
